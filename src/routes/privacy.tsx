import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/landing/site-chrome";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({ meta: [{ title: "Privacy · Kosh" }] }),
});

function Privacy() {
  return (
    <LegalPage title="Privacy">
      <p>Kosh stores as little as it can. This page is the whole policy, not a teaser.</p>
      <h2 className="text-fg">Guest</h2>
      <p>
        If you continue as guest, the portfolio and watchlist live in this browser (local storage). They are not sent to our
        servers. Clearing the site data, or another device, does not see them.
      </p>
      <h2 className="text-fg">Account</h2>
      <p>
        If you sign in with Google, X, or email, we keep an account record (email, name if provided, auth provider) and
        the portfolios you save — names, tickers, quantities, optional average prices and buy dates. Those rows are
        scoped to your user id. We do not sell them.
      </p>
      <h2 className="text-fg">Market data</h2>
      <p>
        Quotes, candles and history come from market data vendors. Headlines are public news RSS matches on the company name.
        A short business extract may come from Wikipedia. Ticker symbols and names you look up are part of those
        requests. Quantity and cost are not. We do not get your brokerage login.
      </p>
      <h2 className="text-fg">Fundamental, Qualitative, Pulse, Ask</h2>
      <p>
        These run for everyone — no sign-in. They send public prices (price, returns, RSI, volume), company numbers on
        file, and the headlines on screen. A portfolio brief sends today’s weights and tickers — not quantities or
        cost. They do not send your holdings unless you open that portfolio brief. Results may be cached for a few hours.
        Sign-in is only to keep portfolios in the cloud.
      </p>
      <h2 className="text-fg">Cookies</h2>
      <p>
        Signed-in sessions use a host-only cookie (and, in the live preview, a bearer handed off from the sign-in
        popup). That is for staying signed in, not for advertising.
      </p>
      <h2 className="text-fg">Contact</h2>
      <p>To delete an account and its portfolios, sign in and write from the address on the account. Guest data is yours to clear in the browser.</p>
    </LegalPage>
  );
}
