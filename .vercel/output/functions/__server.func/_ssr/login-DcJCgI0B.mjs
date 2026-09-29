import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { t as GROK_PROVIDERS } from "./server--8uZ9IxE.mjs";
import { a as Label, i as Seg, mt as Button, n as HeroMix, o as Input, s as BrandLink, vn as cn } from "./router-BsvOSOTS2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DcJCgI0B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GoogleMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
		})
	});
}
function XMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-4",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"
		})
	});
}
function AuthScreen({ initial = "in" }) {
	const [mode, setMode] = (0, import_react.useState)(initial);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [msg, setMsg] = (0, import_react.useState)("");
	const navigate = useNavigate();
	async function onEmail(e) {
		e.preventDefault();
		setBusy(true);
		setMsg("");
		try {
			if (mode === "up") {
				const { error } = await authClient.signUp.email({
					email,
					password,
					name: name || email.split("@")[0]
				});
				if (error) throw new Error(error.message || "Could not create account");
			} else {
				const { error } = await authClient.signIn.email({
					email,
					password
				});
				if (error) throw new Error(error.message || "No match");
			}
			await authClient.getSession();
			navigate({ to: "/app" });
		} catch (err) {
			setMsg(err instanceof Error ? err.message : "Failed");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-dvh lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col px-5 py-6 sm:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandLink, { to: "/" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-[28px] font-semibold tracking-tight",
						children: mode === "in" ? "Sign in" : "Create account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Google, X, or email. Guest keeps the portfolio on this device only."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Seg, {
						className: "mt-6 grid w-full grid-cols-2",
						value: mode,
						onChange: (v) => {
							setMode(v);
							setMsg("");
						},
						options: [{
							id: "in",
							label: "Sign in"
						}, {
							id: "up",
							label: "Create account"
						}]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 grid gap-2",
						children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							className: "w-full",
							onClick: () => void signIn(p.providerId, {
								callbackURL: "/app",
								errorCallbackURL: "/login"
							}),
							children: [
								p.idp === "google" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XMark, {}),
								"Continue with ",
								p.label
							]
						}, p.providerId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-6 flex items-center gap-3 text-[11px] tracking-[0.08em] text-subtle uppercase",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
							"Email",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-3",
						onSubmit: (e) => void onEmail(e),
						children: [
							mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: name,
								onChange: (e) => setName(e.target.value),
								autoComplete: "name"
							})] }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: email,
								onChange: (e) => setEmail(e.target.value),
								type: "email",
								autoComplete: "email",
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: password,
								onChange: (e) => setPassword(e.target.value),
								type: "password",
								autoComplete: mode === "up" ? "new-password" : "current-password",
								required: true,
								minLength: 8
							})] }),
							msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-down",
								children: msg
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy || false,
								children: busy ? "Please wait…" : mode === "in" ? "Sign in with email" : "Create account"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						className: cn("mt-6 w-full"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app",
							children: "Continue as guest"
						})
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hidden bg-bg-elevated lg:grid lg:place-items-center lg:p-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-4 text-[12px] tracking-[0.14em] text-subtle uppercase",
						children: "What you get"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroMix, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "Your stocks versus Nifty, as far back as prices go. Buy dates optional."
					})
				]
			})
		})]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthScreen, { initial: "in" });
//#endregion
export { AuthScreen, SplitComponent as component };
