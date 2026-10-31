import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { alertDetail, type AlertStatus } from "@/lib/kosh/alerts";
import { listingExchange, listingId, listingLabel } from "@/lib/kosh/listing";
import { useKosh, type AlertKind } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({ ssr: false, component: AlertsPage });

function AlertsPage() {
  const alerts = useKosh((s) => s.alerts);
  const addAlert = useKosh((s) => s.addAlert);
  const patchAlert = useKosh((s) => s.patchAlert);
  const removeAlert = useKosh((s) => s.removeAlert);
  const [tab, setTab] = useState<"active" | "triggered" | "expired">("active");
  const [q, setQ] = useState("");
  const [symbol, setSymbol] = useState("");
  const [kind, setKind] = useState<AlertKind>("price");
  const [dir, setDir] = useState<"above" | "below">("above");
  const [level, setLevel] = useState("");
  const [days, setDays] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const rows = useMemo(() => {
    const needle = q.trim().toUpperCase();
    return alerts.filter((row) => {
      const status: AlertStatus = row.expiresAt && Date.now() > row.expiresAt ? "expired" : row.status || "active";
      if (tab === "active" && status !== "active" && status !== "paused") return false;
      if (tab === "triggered" && status !== "triggered") return false;
      if (tab === "expired" && status !== "expired") return false;
      if (!needle) return true;
      return row.symbol.includes(needle) || row.name.toUpperCase().includes(needle);
    });
  }, [alerts, tab, q]);

  return (
    <AppShell>
      <div className="kosh-page grid gap-4">
        <header>
          <h1 className="text-[28px] leading-none font-medium tracking-tight">Alerts</h1>
          <p className="mt-2 max-w-2xl text-[13px] text-muted">
            Checked while this browser has Kosh open, about once a minute. There is no server watcher, email, or phone push. A closed laptop does not fire these.
          </p>
        </header>
        <form
          className="grid gap-2 rounded-lg bg-surface p-4 shadow-[var(--shadow-border)] sm:grid-cols-6"
          onSubmit={(e) => {
            e.preventDefault();
            const id = listingId(symbol);
            const price = Number(level);
            if (!id || (kind !== "high52" && kind !== "low52" && !(price > 0))) return;
            const expiresAt = Number(days) > 0 ? Date.now() + Number(days) * 86400000 : null;
            addAlert({
              symbol: id,
              name: listingLabel(id),
              price: kind === "high52" || kind === "low52" ? 0 : price,
              dir: kind === "low52" ? "below" : dir,
              kind,
              exchange: listingExchange(id) === "BSE" ? "BSE" : "NSE",
              expiresAt,
              timeframe: kind === "ma" || kind === "rsi" ? "1D" : "session",
            });
            setSymbol("");
            setLevel("");
          }}
        >
          <input className="h-10 rounded-sm bg-bg px-3 text-[13px] outline-none" placeholder="Symbol" aria-label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          <select className="h-10 rounded-sm bg-bg px-2 text-[13px]" aria-label="Condition" value={kind} onChange={(e) => setKind(e.target.value as AlertKind)}>
            <option value="price">Price</option>
            <option value="pct">Day %</option>
            <option value="rsi">RSI</option>
            <option value="volume">Volume ×</option>
            <option value="ma">MA cross</option>
            <option value="high52">52w high</option>
            <option value="low52">52w low</option>
          </select>
          <select className="h-10 rounded-sm bg-bg px-2 text-[13px]" aria-label="Direction" value={dir} onChange={(e) => setDir(e.target.value === "below" ? "below" : "above")}>
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
          <input className="h-10 rounded-sm bg-bg px-3 text-[13px] outline-none" placeholder={kind === "ma" ? "50 or 200" : "Level"} aria-label="Level" value={level} onChange={(e) => setLevel(e.target.value)} />
          <input className="h-10 rounded-sm bg-bg px-3 text-[13px] outline-none" placeholder="Expires in days" aria-label="Expiry days" value={days} onChange={(e) => setDays(e.target.value)} />
          <button type="submit" className="h-10 rounded-sm bg-fg px-3 text-[13px] text-bg">Create</button>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          {(["active", "triggered", "expired"] as const).map((id) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={cn("h-9 rounded-sm px-3 text-[13px] capitalize", tab === id ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted")}>{id}</button>
          ))}
          <input className="h-9 rounded-sm bg-surface px-3 text-[13px] outline-none" placeholder="Filter" aria-label="Filter alerts" value={q} onChange={(e) => setQ(e.target.value)} />
          <button
            type="button"
            className="h-9 rounded-sm px-3 text-[13px] text-muted"
            onClick={async () => {
              if (typeof Notification === "undefined") {
                setNote("This browser does not offer notifications.");
                return;
              }
              const perm = await Notification.requestPermission();
              setNote(perm === "granted" ? "Notifications allowed while this browser is open." : "Notifications were not allowed.");
            }}
          >
            Browser notification
          </button>
        </div>
        {note ? <p className="text-[13px] text-muted">{note}</p> : null}
        {!rows.length ? <p className="text-sm text-muted">Nothing in this list.</p> : null}
        <ul className="grid gap-2">
          {rows.map((row) => (
            <li key={row.id} className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <Link to="/s/$symbol" params={{ symbol: listingId(row.symbol) }} className="font-medium hover:text-chart">{row.name || listingLabel(row.symbol)}</Link>
                  <span className="ml-2 font-mono text-[12px] text-muted">{listingLabel(row.symbol)} · {row.exchange || listingExchange(row.symbol)}</span>
                  <div className="text-[13px] text-muted">{alertDetail(row)} · {row.status || "active"}{row.timeframe ? ` · ${row.timeframe}` : ""}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-[12px]">
                  <button type="button" onClick={() => patchAlert(row.id, { status: row.status === "paused" ? "active" : "paused" })}>{row.status === "paused" ? "Resume" : "Pause"}</button>
                  <button
                    type="button"
                    onClick={() =>
                      addAlert({
                        symbol: row.symbol,
                        name: row.name,
                        price: row.price,
                        dir: row.dir,
                        kind: row.kind,
                        exchange: row.exchange,
                        timeframe: row.timeframe,
                        expiresAt: row.expiresAt,
                      })
                    }
                  >
                    Duplicate
                  </button>
                  {row.status === "triggered" ? <button type="button" onClick={() => patchAlert(row.id, { status: "active", triggeredAt: null })}>Arm again</button> : null}
                  <button type="button" onClick={() => removeAlert(row.id)}>Delete</button>
                </div>
              </div>
              <p className="mt-1 text-[12px] text-subtle">
                Created {row.createdAt ? new Date(row.createdAt).toLocaleString("en-IN") : "earlier"}
                {row.expiresAt ? ` · expires ${new Date(row.expiresAt).toLocaleDateString("en-IN")}` : ""}
                {row.triggeredAt ? ` · triggered ${new Date(row.triggeredAt).toLocaleString("en-IN")}` : ""}
              </p>
              {row.history?.length ? (
                <ul className="mt-2 text-[12px] text-muted">
                  {row.history.slice(0, 4).map((item) => (
                    <li key={item.at}>{new Date(item.at).toLocaleString("en-IN")} · {item.note}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
