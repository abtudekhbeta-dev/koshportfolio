# Public production 500 — verification

Checked 2026-09-29 ~04:51–05:01 UTC. The public site was down. It is serving the Kosh UI again only after a new production deployment. This is not a localhost result.

## 1. Exact public URL tested

https://koshportfolio.grok.me/

DNS: Cloudflare `104.16.87.25`, `104.16.88.25` (also `104.16.88.25` / `104.16.87.25`). No redirect on `/`. Final URL is the same host.

Markets final URL after one redirect: https://koshportfolio.grok.me/markets?view=terminal

## 2. Production deployment

| | Before | After |
|---|---|---|
| App deployment | `01a0eb76-a236-7a43-89a3-13f7d908de07` | `01a0eb88-5185-7061-9623-8ddb85d2aa9b` |
| Vercel deployment | `dpl_7wJP7nzizSTUwX2XAidU7jx1BQhg` | `dpl_AxHM8ZvDJRtbixM4ti36zm4RpP4g` |
| Project | `01a04ee8-e1d1-7a32-b3b1-e9aaa8fdc4cf` (`koshportfolio`) | same |
| Provider | Vercel, hostname `koshportfolio.grok.me` | same |
| Started | 2026-09-29 04:40:15 UTC | 2026-09-29 04:59:34 UTC |
| Ready | 2026-09-29 04:40:36 UTC | 2026-09-29 05:00:07 UTC |

A probe deployment `01a0eb87-24db-78f3-9c36-edcc8f7c6f6a` was created while identifying the upload protocol and failed immediately (`archive stream ended after 0 of 100 declared bytes`). It never became the live site.

## 3. Commit / version deployed

GitHub `abtudekhbeta-dev/koshportfolio` `48e7aab` (“Export from Grok”, 2026-09-29 04:22:29 UTC) is **not** the fixed build. That commit still has the crashing top-level `NIFTY50.map` and a build script that does not copy PGLite assets.

The deployment that is live now was uploaded from the workspace source at ~04:59 UTC (the outage fix), then built by the app deployer. There is no new git SHA for that upload.

## 4. Homepage HTTP status

Before (fresh request, no redirect), 2026-09-29 04:51:32 UTC:

- `HTTP/2 500`
- `content-type: application/json;charset=UTF-8`
- `x-vercel-cache: MISS`
- `x-vercel-id: iad1::iad1::xrfm4-1790657492488-2d991d3fc0ac`
- `x-envoy-upstream-service-time: 46`
- body: `{"status":500,"unhandled":true,"message":"HTTPError"}`

After, 2026-09-29 05:00:14 UTC:

- `HTTP/2 200`
- `content-type: text/html; charset=utf-8`
- `x-vercel-cache: MISS`
- `x-vercel-id: iad1::iad1::z5s2t-1790658014096-659bb7f1527e`
- `x-envoy-upstream-service-time: 557`
- zero redirects
- HTML title: `Kosh · Indian markets and portfolios`

## 5. Exact failing request before the fix

The **document** request failed. It was not a follow-on API.

- URL: `https://koshportfolio.grok.me/`
- Method: `GET`
- Status: `500`
- Resource type: Document
- Initiator: browser navigation (fresh session, not an existing tab)
- Response body: `{"status":500,"unhandled":true,"message":"HTTPError"}`
- Timing: about 37–54 ms upstream (`x-envoy-upstream-service-time`), which matches a synchronous crash during server startup, not a slow database boot
- `/markets` returned the same JSON 500 with no HTML

`HTTPError` is only the h3 wrapper. When `unhandled` is true, h3 always serializes the message as the string `HTTPError` and hides the real exception.

## 6. Underlying exception

Reproduced from the server bundle that the previous deployment was serving (`router-BsvOSOTS.mjs` line 4490, present in git `48e7aab` and in the pre-fix `.vercel/output`):

```
TypeError: Cannot read properties of undefined (reading 'map')
    at router-BsvOSOTS.mjs:4490:29
    at ModuleJob.run
    at async loadEntries (ssr.mjs)
```

That line is:

```js
var NIFTY = new Set(NIFTY50.map((x) => x.symbol.toUpperCase()));
```

`screens.ts` built `NIFTY` at module scope. The production bundler split the router into two chunks that import each other. This chunk read `NIFTY50` before the other chunk had assigned the array, so the import was still `undefined`. Dev ESM live bindings hide that. The same top-level `.map` existed in `portfolio-stats.ts`, and `skill-board.server.ts` called `scanList()` at module scope (which spreads those arrays).

The homepage imports the screener, so the document request died inside SSR `loadEntries` before any UI was sent.

## 7. Fix applied

No new product features.

- `src/lib/kosh/screens.ts` — build the Nifty set on first use (`niftySymbols()`), not at import.
- `src/lib/kosh/portfolio-stats.ts` — same lazy set for `isNifty50`.
- `src/lib/kosh/skill-board.server.ts` — build the scan universe on first use (`getUniverse()`).
- `src/lib/db.ts` — PGLite bootstrap failure is logged and does not reject as an unhandled exception that takes down the document.
- `scripts/copy-pglite-assets.mjs` — after `vite build`, copy `pglite.wasm`, `pglite.data`, and `initdb.wasm` next to the server bundle.
- `package.json` `build` — runs that copy before migrate.

The fixed bundle uses `router-D75dEx_h.mjs`, where `NIFTY50.map` sits inside `niftySymbols()`, not at the top level.

## 8. Was PGLite involved?

Yes, as a second defect in the same deployment, not as the exception that produced this particular 500.

The previous production function bundle references `./pglite.data`, `./pglite.wasm`, and `./initdb.wasm` beside `electric-sql__pglite.mjs`. Those three files were **not** in the deployed bundle (confirmed absent from git `48e7aab` `.vercel/output/.../_libs/`). An earlier production boot logged `ENOENT` for `pglite.data` and `initdb.wasm`.

The request users saw still died first on `NIFTY50.map` (~50 ms). A missing data file would have been the next crash once that throw was removed. The uploaded source copies the three files during the production build. The public homepage and `/api/tape` now return 200. Vercel’s function filesystem was not listed directly (no Vercel API token); asset presence is from the build step in the uploaded source, not from a directory listing of `dpl_AxHM8ZvDJRtbixM4ti36zm4RpP4g`.

## 9. Stale deployment / cache

Yes. The fix was only in the workspace. The active deployment until 05:00 UTC was still `01a0eb76-…` from 04:40:15 UTC, which does not contain the lazy init or the asset copy.

`x-vercel-cache: MISS` and `cf-cache-status: DYNAMIC` on both the 500 and the later 200. This was not a stale CDN copy of an old 500. The function itself was the old build.

No application or user data was deleted.

## 10. Fresh deployment

Source archive of the workspace (node_modules, `.git`, `.vercel`, and screenshots excluded) was uploaded to the app deployer and became deployment `01a0eb88-5185-7061-9623-8ddb85d2aa9b` / `dpl_AxHM8ZvDJRtbixM4ti36zm4RpP4g` on `koshportfolio.grok.me`. Deployer status moved to the same ready state as the previous live deployment (`4`) at 05:00:07 UTC.

## 11. Fresh browser result

New browser session, not an existing tab, opened `https://koshportfolio.grok.me/?fresh=1790658022`.

- Final URL: `https://koshportfolio.grok.me/?fresh=1790658022`
- Document: rendered Kosh (nav, Nifty 50 tape, portfolio cards, holdings). Not the JSON error.
- Screenshot: `/workspace/screenshots/public-home-after.png`
- The earlier failing session screenshot is `/workspace/screenshots/public-home-500.png` (body text was the 500 JSON).

## 12. Markets

`GET /markets` → `307` to `/markets?view=terminal` → `200` HTML.

Fresh browser landed on `https://koshportfolio.grok.me/markets?view=terminal` and rendered the terminal (Reliance chart, timeframe buttons). Screenshot: `/workspace/screenshots/public-markets-after.png`.

`GET /api/tape` → `200` `application/json` with Nifty/Sensex rows.

## 13. Console

On that fresh session, after home and markets loaded: no console entries and no page errors.

## 14. Public URL, not localhost

The pass/fail calls above are `https://koshportfolio.grok.me`. Local preview was not used as evidence that the public site was up. It was down at 04:51 UTC and at 04:54 UTC (browser document 500, `x-vercel-id` `iad1::iad1::tm96j-1790657672123-acc10de4ea8b`) and returned 200 HTML only after deployment `dpl_AxHM8ZvDJRtbixM4ti36zm4RpP4g` became ready.

## Remaining limitations

- GitHub `48e7aab` is still the crashing source. Rebuilding production from that commit, without the workspace fix, would bring the 500 back.
- Vercel runtime logs for the old function were not available from this environment. The stack trace is from the server bundle that deployment was built from, at the line that throws.
- PGLite files inside the new Vercel image were not listed via the Vercel API.
- Market figures on the public page are the app’s delayed tape, not a new data vendor.
