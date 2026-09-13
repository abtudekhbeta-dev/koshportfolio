import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppProviders } from "@/components/app-providers";
import { NotFound } from "@/components/not-found";
import appCss from "../styles.css?url";

const THEME_BOOT = `(function(){try{var t=JSON.parse(localStorage.getItem("kosh-v2")||"{}");var th=(t.state&&t.state.theme)||"dark";document.documentElement.setAttribute("data-theme",th==="light"?"light":"dark")}catch(e){document.documentElement.setAttribute("data-theme","dark")}})();`;

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kosh · Indian markets and portfolios" },
      { name: "theme-color", content: "#09090b" },
      {
        name: "description",
        content: "Indian stocks: live prices, candles, screens, and a portfolio versus Nifty. Search a name. Not a broker.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" data-theme="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg font-sans">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <PreviewHostBridge />
        <AuthProvider>
          <AppProviders>
            <Outlet />
          </AppProviders>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
