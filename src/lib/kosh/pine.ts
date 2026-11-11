/** A small Pine-like runner for the market terminal.
 *  v5 and v6 share this subset. Anything outside it is an error, not a guessed value.
 */

import type { OhlcBar } from "./types.ts";
import { atr, ema, rsi, sma } from "./ohlc.ts";

export type PineError = { line: number; message: string };
export type PineInput = { id: string; title: string; kind: "int" | "float" | "bool"; def: number | boolean };
export type PinePlot = { title: string; color: string; overlay: boolean; values: (number | null)[] };

export const PINE_SUPPORTED = [
  "indicator()",
  "input.int",
  "input.float",
  "input.bool",
  "plot",
  "hline",
  "ta.sma",
  "ta.ema",
  "ta.rsi",
  "ta.atr",
  "ta.highest",
  "ta.lowest",
  "ta.crossover",
  "ta.crossunder",
  "ta.change",
  "math.abs",
  "math.max",
  "math.min",
  "math.round",
  "math.sqrt",
  "open high low close volume hl2 hlc3 ohlc4 bar_index",
  "series lookback close[1]",
  "if / else and the ?: operator",
] as const;

export const PINE_UNSUPPORTED = [
  "strategy and order backtests",
  "request.security and other timeframes",
  "array, matrix, map, and user-defined types",
  "var and varip",
  "for, while, and switch",
  "import and libraries",
  "alertcondition",
  "line, label, box, table, and polyline drawings",
  "ta.macd and ta.bb tuple results",
] as const;

const COLORS: Record<string, string> = {
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#16a34a",
  orange: "#f59e0b",
  purple: "#a855f7",
  teal: "#0f766e",
  gray: "#737373",
  grey: "#737373",
  white: "#e5e5e5",
  black: "#111111",
  aqua: "#22d3ee",
  yellow: "#eab308",
  lime: "#84cc16",
};

const BANNED = ["strategy", "request", "array", "matrix", "map", "var", "varip", "for", "while", "switch", "import", "type", "method", "alertcondition", "line", "label", "box", "table", "polyline"];

type Tok = { k: string; v: string; line: number };
type Expr =
  | { t: "num"; v: number; line: number }
  | { t: "bool"; v: boolean; line: number }
  | { t: "str"; v: string; line: number }
  | { t: "na"; line: number }
  | { t: "name"; v: string; line: number }
  | { t: "look"; v: string; n: Expr; line: number }
  | { t: "call"; id: number; name: string; args: Expr[]; named: { k: string; v: Expr }[]; line: number }
  | { t: "un"; op: string; x: Expr; line: number }
  | { t: "bin"; op: string; l: Expr; r: Expr; line: number }
  | { t: "tri"; c: Expr; a: Expr; b: Expr; line: number };

type Stmt =
  | { t: "indicator"; title: string; overlay: boolean; line: number }
  | { t: "assign"; name: string; expr: Expr; line: number }
  | { t: "plot"; expr: Expr; title: string; color: string; line: number }
  | { t: "hline"; expr: Expr; title: string; color: string; line: number }
  | { t: "if"; cond: Expr; yes: Stmt[]; no: Stmt[]; line: number };

let callSeq = 0;
const MAX_BARS = 4000;
const MAX_STEPS = 1_500_000;

export function pineVersion(source: string): number | null {
  const match = source.match(/\/\/@version\s*=\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

export function compilePine(source: string): { ok: true; version: number | null; title: string; overlay: boolean; inputs: PineInput[] } | { ok: false; errors: PineError[] } {
  try {
    const parsed = parse(source);
    if (parsed.version != null && parsed.version !== 5 && parsed.version !== 6) {
      return { ok: false, errors: [{ line: 1, message: `Pine v${parsed.version} is not supported. This editor runs a documented subset of v5 and v6.` }] };
    }
    const inputs = collectInputs(parsed.stmts);
    const indicator = parsed.stmts.find((stmt) => stmt.t === "indicator");
    if (!indicator || indicator.t !== "indicator") return { ok: false, errors: [{ line: 1, message: "Add an indicator() line. strategy() is not supported." }] };
    return { ok: true, version: parsed.version, title: indicator.title, overlay: indicator.overlay, inputs };
  } catch (error) {
    return { ok: false, errors: [asError(error)] };
  }
}

export function runPine(source: string, bars: OhlcBar[], overrides: Record<string, number | boolean> = {}, maxSteps = MAX_STEPS): { plots: PinePlot[]; warnings: string[]; errors: PineError[]; overlay: boolean } {
  const compiled = compilePine(source);
  if (!compiled.ok) return { plots: [], warnings: [], errors: compiled.errors, overlay: true };
  if (!bars.length) return { plots: [], warnings: [], errors: [{ line: 1, message: "No candles are loaded, so the script was not run." }], overlay: compiled.overlay };
  try {
    const parsed = parse(source);
    const used = bars.length > MAX_BARS ? bars.slice(-MAX_BARS) : bars;
    const warnings = bars.length > MAX_BARS ? [`Only the latest ${MAX_BARS} bars were used.`] : [];
    if (compiled.version == null) warnings.push("No //@version line. The script was read as the selected v5/v6 subset.");
    const plots = execute(parsed.stmts, used, overrides, compiled.overlay, maxSteps);
    return { plots, warnings, errors: [], overlay: compiled.overlay };
  } catch (error) {
    return { plots: [], warnings: [], errors: [asError(error)], overlay: compiled.overlay };
  }
}

export function highlightPine(line: string): { text: string; kind: string }[] {
  const parts: { text: string; kind: string }[] = [];
  const re = /\/\/.*|"(?:[^"\\]|\\.)*"|'[^']*'|\b(?:if|else|and|or|not|na|true|false|indicator|plot|hline)\b|\b(?:ta|input|math|color)\.[A-Za-z_]\w*|\b\d+(?:\.\d+)?\b|[A-Za-z_]\w*|./g;
  for (const match of line.matchAll(re)) {
    const text = match[0];
    let kind = "plain";
    if (text.startsWith("//")) kind = "note";
    else if (text.startsWith('"') || text.startsWith("'")) kind = "str";
    else if (/^(if|else|and|or|not|na|true|false|indicator|plot|hline)$/.test(text)) kind = "key";
    else if (/^(ta|input|math|color)\./.test(text)) kind = "fn";
    else if (/^\d/.test(text)) kind = "num";
    parts.push({ text, kind });
  }
  return parts.length ? parts : [{ text: line || " ", kind: "plain" }];
}

export function matchingBracket(source: string, index: number): number | null {
  const open = "([{";
  const close = ")]}";
  const ch = source[index];
  const pair = open.includes(ch) ? close[open.indexOf(ch)] : open[close.indexOf(ch)];
  if (!pair) return null;
  const dir = open.includes(ch) ? 1 : -1;
  let depth = 0;
  for (let i = index; i >= 0 && i < source.length; i += dir) {
    if (source[i] === ch) depth += 1;
    else if (source[i] === pair) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return null;
}

function asError(error: unknown): PineError {
  if (error && typeof error === "object" && "line" in error && "message" in error) return error as PineError;
  return { line: 1, message: error instanceof Error ? error.message : "The script failed." };
}

function fail(line: number, message: string): never {
  throw { line, message };
}

function strip(source: string): { version: number | null; lines: { n: number; indent: number; text: string }[] } {
  const version = pineVersion(source);
  const lines = source.split(/\r?\n/).map((raw, index) => {
    const text = raw.replace(/\/\/.*$/, "").trimEnd();
    const indent = text.match(/^\s*/)?.[0].length || 0;
    return { n: index + 1, indent, text: text.trim() };
  }).filter((line) => line.text && !line.text.startsWith("//@"));
  return { version, lines };
}

function parse(source: string): { version: number | null; stmts: Stmt[] } {
  const { version, lines } = strip(source);
  let i = 0;
  function block(parentIndent: number): Stmt[] {
    const out: Stmt[] = [];
    if (i >= lines.length || lines[i].indent <= parentIndent) return out;
    const level = lines[i].indent;
    while (i < lines.length && lines[i].indent >= level) {
      if (lines[i].indent > level) fail(lines[i].n, "Indent more only under an if.");
      const line = lines[i];
      i += 1;
      if (/^if\b/.test(line.text)) {
        const cond = parseExpr(line.text.slice(2).trim(), line.n);
        const yes = block(line.indent);
        let no: Stmt[] = [];
        if (i < lines.length && lines[i].indent === line.indent && lines[i].text === "else") {
          i += 1;
          no = block(line.indent);
        }
        out.push({ t: "if", cond, yes, no, line: line.n });
        continue;
      }
      if (line.text === "else") fail(line.n, "else needs an if above it.");
      out.push(parseStmt(line.text, line.n));
    }
    return out;
  }
  const stmts = block(-1);
  guard(stmts);
  return { version, stmts };
}

function guard(stmts: Stmt[]) {
  const walk = (stmt: Stmt) => {
    if (stmt.t === "if") {
      walkExpr(stmt.cond);
      stmt.yes.forEach(walk);
      stmt.no.forEach(walk);
      return;
    }
    if (stmt.t === "assign") walkExpr(stmt.expr);
    if (stmt.t === "plot" || stmt.t === "hline") walkExpr(stmt.expr);
  };
  const walkExpr = (expr: Expr) => {
    if (expr.t === "name" && BANNED.includes(expr.v)) fail(expr.line, `${expr.v} is not in this Pine subset.`);
    if (expr.t === "call") {
      const head = expr.name.split(".")[0];
      if (BANNED.includes(head) || BANNED.includes(expr.name)) fail(expr.line, `${expr.name}() is not supported. No value was invented.`);
      if (expr.name === "ta.macd" || expr.name === "ta.bb") fail(expr.line, `${expr.name}() returns several series. This subset does not destructure tuples.`);
      expr.args.forEach(walkExpr);
      expr.named.forEach((item) => walkExpr(item.v));
    }
    if (expr.t === "un") walkExpr(expr.x);
    if (expr.t === "bin") { walkExpr(expr.l); walkExpr(expr.r); }
    if (expr.t === "tri") { walkExpr(expr.c); walkExpr(expr.a); walkExpr(expr.b); }
    if (expr.t === "look") walkExpr(expr.n);
  };
  stmts.forEach(walk);
}

function parseStmt(text: string, line: number): Stmt {
  if (text.startsWith("indicator(")) {
    const call = parseExpr(text, line);
    if (call.t !== "call") fail(line, "indicator() could not be read.");
    const title = call.args[0]?.t === "str" ? call.args[0].v : "Script";
    const overlay = call.named.find((item) => item.k === "overlay");
    const on = overlay?.v.t === "bool" ? overlay.v.v : true;
    return { t: "indicator", title, overlay: on, line };
  }
  if (text.startsWith("plot(") || text.startsWith("hline(")) {
    const call = parseExpr(text, line);
    if (call.t !== "call") fail(line, "That plot could not be read.");
    const title = call.args[1]?.t === "str" ? call.args[1].v : call.name;
    const colorArg = call.named.find((item) => item.k === "color");
    const color = colorOf(colorArg?.v) || "#0f766e";
    if (!call.args[0]) fail(line, `${call.name}() needs a series.`);
    return { t: call.name === "hline" ? "hline" : "plot", expr: call.args[0], title, color, line };
  }
  const assign = text.match(/^([A-Za-z_]\w*)\s*(?::=|=)\s*(.+)$/);
  if (!assign) fail(line, "This line is not an assignment, indicator, plot, or if.");
  return { t: "assign", name: assign[1], expr: parseExpr(assign[2], line), line };
}

function colorOf(expr: Expr | undefined): string | null {
  if (!expr) return null;
  if (expr.t === "name" && expr.v.startsWith("color.")) return COLORS[expr.v.slice(6)] || null;
  if (expr.t === "str" && /^#([0-9a-fA-F]{6})$/.test(expr.v)) return expr.v;
  return null;
}

function tokenize(text: string, line: number): Tok[] {
  const out: Tok[] = [];
  const re = /\s+|"(?:[^"\\]|\\.)*"|true|false|na|[A-Za-z_][\w.]*|\d+(?:\.\d+)?|>=|<=|==|!=|:=|\?|:|\[|\]|\(|\)|,|=|[+\-*/%<>]/g;
  for (const match of text.matchAll(re)) {
    const v = match[0];
    if (/^\s+$/.test(v)) continue;
    if (/^"/.test(v)) out.push({ k: "str", v: v.slice(1, -1), line });
    else if (/^(true|false)$/.test(v)) out.push({ k: "bool", v, line });
    else if (v === "na") out.push({ k: "na", v, line });
    else if (/^(and|or|not)$/.test(v)) out.push({ k: v, v, line });
    else if (/^[A-Za-z_]/.test(v)) out.push({ k: "id", v, line });
    else if (/^\d/.test(v)) out.push({ k: "num", v, line });
    else out.push({ k: v, v, line });
  }
  return out;
}

function parseExpr(text: string, line: number): Expr {
  const toks = tokenize(text, line);
  let i = 0;
  const peek = () => toks[i];
  const eat = (k?: string) => {
    const tok = toks[i];
    if (!tok || (k && tok.k !== k && tok.v !== k)) fail(line, "The expression could not be read.");
    i += 1;
    return tok;
  };
  function expr(): Expr { return ternary(); }
  function ternary(): Expr {
    const c = or();
    if (peek()?.k === "?") {
      eat("?");
      const a = expr();
      eat(":");
      return { t: "tri", c, a, b: expr(), line };
    }
    return c;
  }
  function or(): Expr { return fold(["or"], and); }
  function and(): Expr { return fold(["and"], cmp); }
  function cmp(): Expr { return fold(["==", "!=", ">", "<", ">=", "<="], add); }
  function add(): Expr { return fold(["+", "-"], mul); }
  function mul(): Expr { return fold(["*", "/", "%"], unary); }
  function fold(ops: string[], next: () => Expr): Expr {
    let left = next();
    while (peek() && ops.includes(peek().k)) {
      const op = eat().k;
      left = { t: "bin", op, l: left, r: next(), line };
    }
    return left;
  }
  function unary(): Expr {
    if (peek()?.k === "not" || peek()?.k === "-") {
      const op = eat().k;
      return { t: "un", op, x: unary(), line };
    }
    return primary();
  }
  function primary(): Expr {
    const tok = eat();
    if (tok.k === "num") return { t: "num", v: Number(tok.v), line };
    if (tok.k === "str") return { t: "str", v: tok.v, line };
    if (tok.k === "bool") return { t: "bool", v: tok.v === "true", line };
    if (tok.k === "na") return { t: "na", line };
    if (tok.k === "(") {
      const inner = expr();
      eat(")");
      return inner;
    }
    if (tok.k !== "id") fail(line, "The expression could not be read.");
    if (peek()?.k === "(") {
      eat("(");
      const args: Expr[] = [];
      const named: { k: string; v: Expr }[] = [];
      while (peek() && peek().k !== ")") {
        if (peek().k === "id" && toks[i + 1]?.k === "=") {
          const key = eat().v;
          eat("=");
          named.push({ k: key, v: expr() });
        } else args.push(expr());
        if (peek()?.k === ",") eat(",");
      }
      eat(")");
      return { t: "call", id: ++callSeq, name: tok.v, args, named, line };
    }
    if (peek()?.k === "[") {
      eat("[");
      const n = expr();
      eat("]");
      return { t: "look", v: tok.v, n, line };
    }
    return { t: "name", v: tok.v, line };
  }
  const node = expr();
  if (i < toks.length) fail(line, "There is extra text in the expression.");
  return node;
}

function collectInputs(stmts: Stmt[]): PineInput[] {
  const inputs: PineInput[] = [];
  const walk = (stmt: Stmt) => {
    if (stmt.t === "assign" && stmt.expr.t === "call" && stmt.expr.name.startsWith("input.")) {
      const kind = stmt.expr.name.slice(6);
      if (kind !== "int" && kind !== "float" && kind !== "bool") fail(stmt.line, `${stmt.expr.name} is not supported.`);
      const defExpr = stmt.expr.args[0];
      const title = stmt.expr.args[1]?.t === "str" ? stmt.expr.args[1].v : stmt.name;
      const def = defExpr?.t === "num" ? defExpr.v : defExpr?.t === "bool" ? defExpr.v : null;
      if (def == null || (kind === "bool" && typeof def !== "boolean") || (kind !== "bool" && typeof def !== "number")) {
        fail(stmt.line, "An input default must be a literal number or true/false.");
      }
      inputs.push({ id: stmt.name, title, kind, def });
    }
    if (stmt.t === "if") {
      stmt.yes.forEach(walk);
      stmt.no.forEach(walk);
    }
  };
  stmts.forEach(walk);
  return inputs;
}

type Env = {
  bars: OhlcBar[];
  i: number;
  series: Map<string, (number | null)[]>;
  inputs: Map<string, number | boolean>;
  sites: Map<string, (number | null)[]>;
  prev: Map<string, { a: number | null; b: number | null }>;
  steps: number;
  maxSteps: number;
  overlay: boolean;
  plots: Map<string, PinePlot>;
};

function execute(stmts: Stmt[], bars: OhlcBar[], overrides: Record<string, number | boolean>, overlay: boolean, maxSteps: number): PinePlot[] {
  const inputs = new Map<string, number | boolean>();
  for (const input of collectInputs(stmts)) inputs.set(input.id, overrides[input.id] ?? input.def);
  const env: Env = { bars, i: 0, series: new Map(), inputs, sites: new Map(), prev: new Map(), steps: 0, maxSteps, overlay, plots: new Map() };
  for (let i = 0; i < bars.length; i++) {
    env.i = i;
    runStmts(stmts, env);
  }
  return [...env.plots.values()];
}

function runStmts(stmts: Stmt[], env: Env) {
  for (const stmt of stmts) {
    env.steps += 1;
    if (env.steps > env.maxSteps) fail(stmt.line, "The script was stopped because it did too much work.");
    if (stmt.t === "indicator") continue;
    if (stmt.t === "assign") {
      if (stmt.expr.t === "call" && stmt.expr.name.startsWith("input.")) continue;
      const value = evalExpr(stmt.expr, env);
      const row = env.series.get(stmt.name) || Array(env.bars.length).fill(null);
      row[env.i] = value;
      env.series.set(stmt.name, row);
    } else if (stmt.t === "if") {
      const cond = evalExpr(stmt.cond, env);
      runStmts(cond != null && cond !== 0 ? stmt.yes : stmt.no, env);
    } else if (stmt.t === "plot" || stmt.t === "hline") {
      const value = stmt.t === "hline" ? evalExpr(stmt.expr, env) : evalExpr(stmt.expr, env);
      const key = `${stmt.line}:${stmt.title}`;
      const plot = env.plots.get(key) || { title: stmt.title, color: stmt.color, overlay: env.overlay, values: Array(env.bars.length).fill(null) };
      plot.values[env.i] = value;
      env.plots.set(key, plot);
    }
  }
}

function num(value: number | null, line: number, label: string): number {
  if (value == null || !Number.isFinite(value)) fail(line, `${label} needs a number.`);
  return value;
}

function evalExpr(expr: Expr, env: Env): number | null {
  env.steps += 1;
  if (env.steps > env.maxSteps) fail(expr.line, "The script was stopped because it did too much work.");
  if (expr.t === "num") return expr.v;
  if (expr.t === "bool") return expr.v ? 1 : 0;
  if (expr.t === "na") return null;
  if (expr.t === "str") fail(expr.line, "A title cannot be used as a number.");
  if (expr.t === "name") return readName(expr.v, env, expr.line);
  if (expr.t === "look") {
    const back = num(evalExpr(expr.n, env), expr.line, "A lookback");
    if (back < 0 || !Number.isInteger(back)) fail(expr.line, "A lookback has to be a whole number of bars.");
    return readName(expr.v, env, expr.line, back);
  }
  if (expr.t === "un") {
    const x = evalExpr(expr.x, env);
    if (x == null) return null;
    if (expr.op === "-") return -x;
    return x === 0 ? 1 : 0;
  }
  if (expr.t === "tri") {
    const c = evalExpr(expr.c, env);
    return evalExpr(c != null && c !== 0 ? expr.a : expr.b, env);
  }
  if (expr.t === "bin") {
    if (expr.op === "and" || expr.op === "or") {
      const l = evalExpr(expr.l, env);
      if (expr.op === "and" && (l == null || l === 0)) return 0;
      if (expr.op === "or" && l != null && l !== 0) return 1;
      const r = evalExpr(expr.r, env);
      return r != null && r !== 0 ? 1 : 0;
    }
    const l = evalExpr(expr.l, env);
    const r = evalExpr(expr.r, env);
    if (l == null || r == null) return expr.op === "==" || expr.op === "!=" ? (expr.op === "==" ? (l == null && r == null ? 1 : 0) : (l == null && r == null ? 0 : 1)) : null;
    if (expr.op === "+") return l + r;
    if (expr.op === "-") return l - r;
    if (expr.op === "*") return l * r;
    if (expr.op === "/") return r === 0 ? null : l / r;
    if (expr.op === "%") return r === 0 ? null : l % r;
    if (expr.op === ">") return l > r ? 1 : 0;
    if (expr.op === "<") return l < r ? 1 : 0;
    if (expr.op === ">=") return l >= r ? 1 : 0;
    if (expr.op === "<=") return l <= r ? 1 : 0;
    if (expr.op === "==") return l === r ? 1 : 0;
    if (expr.op === "!=") return l !== r ? 1 : 0;
  }
  if (expr.t === "call") return callFn(expr, env);
  return null;
}

function readName(name: string, env: Env, line: number, back = 0): number | null {
  const at = env.i - back;
  if (at < 0) return null;
  const bar = env.bars[at];
  if (name === "open") return bar.o;
  if (name === "high") return bar.h;
  if (name === "low") return bar.l;
  if (name === "close") return bar.c;
  if (name === "volume") return bar.v ?? null;
  if (name === "hl2") return (bar.h + bar.l) / 2;
  if (name === "hlc3") return (bar.h + bar.l + bar.c) / 3;
  if (name === "ohlc4") return (bar.o + bar.h + bar.l + bar.c) / 4;
  if (name === "bar_index") return at;
  if (name.startsWith("color.")) return null;
  if (env.inputs.has(name) && back === 0) {
    const value = env.inputs.get(name);
    return typeof value === "boolean" ? (value ? 1 : 0) : (value as number);
  }
  const series = env.series.get(name);
  if (!series) fail(line, `${name} has not been set.`);
  return series[at] ?? null;
}

function siteBuf(expr: Expr, env: Env, id: string): (number | null)[] {
  const key = id;
  const buf = env.sites.get(key) || [];
  buf.push(evalExpr(expr, env));
  env.sites.set(key, buf);
  return buf;
}

function callFn(expr: Extract<Expr, { t: "call" }>, env: Env): number | null {
  const name = expr.name;
  if (name === "math.abs" || name === "math.round" || name === "math.sqrt") {
    const x = evalExpr(expr.args[0], env);
    if (x == null) return null;
    if (name === "math.abs") return Math.abs(x);
    if (name === "math.round") return Math.round(x);
    return x < 0 ? null : Math.sqrt(x);
  }
  if (name === "math.max" || name === "math.min") {
    const a = evalExpr(expr.args[0], env);
    const b = evalExpr(expr.args[1], env);
    if (a == null || b == null) return null;
    return name === "math.max" ? Math.max(a, b) : Math.min(a, b);
  }
  if (name === "ta.sma" || name === "ta.ema" || name === "ta.rsi" || name === "ta.highest" || name === "ta.lowest" || name === "ta.change") {
    const src = expr.args[0];
    const lenExpr = expr.args[1];
    if (!src) fail(expr.line, `${name}() needs a source.`);
    const buf = siteBuf(src, env, String(expr.id));
    const values = buf.map((value) => value ?? Number.NaN);
    if (name === "ta.change") {
      const length = lenExpr ? num(evalExpr(lenExpr, env), expr.line, "Length") : 1;
      const prev = buf[buf.length - 1 - length];
      const cur = buf[buf.length - 1];
      if (prev == null || cur == null) return null;
      return cur - prev;
    }
    const length = num(lenExpr ? evalExpr(lenExpr, env) : null, expr.line, "Length");
    if (length < 1 || !Number.isInteger(length)) fail(expr.line, "Length has to be a positive whole number.");
    if (values.some((value) => !Number.isFinite(value))) return null;
    if (name === "ta.sma") return sma(values, length).at(-1) ?? null;
    if (name === "ta.ema") return ema(values, length).at(-1) ?? null;
    if (name === "ta.rsi") return rsi(values, length).at(-1) ?? null;
    if (buf.length < length) return null;
    const window = buf.slice(-length);
    if (window.some((value) => value == null)) return null;
    const nums = window as number[];
    return name === "ta.highest" ? Math.max(...nums) : Math.min(...nums);
  }
  if (name === "ta.atr") {
    const length = num(evalExpr(expr.args[0], env), expr.line, "Length");
    return atr(env.bars.slice(0, env.i + 1), length).at(-1) ?? null;
  }
  if (name === "ta.crossover" || name === "ta.crossunder") {
    const a = evalExpr(expr.args[0], env);
    const b = evalExpr(expr.args[1], env);
    const key = `${expr.id}:cross`;
    const prev = env.prev.get(key) || { a: null, b: null };
    env.prev.set(key, { a, b });
    if (a == null || b == null || prev.a == null || prev.b == null) return 0;
    if (name === "ta.crossover") return prev.a <= prev.b && a > b ? 1 : 0;
    return prev.a >= prev.b && a < b ? 1 : 0;
  }
  if (name.startsWith("input.")) {
    fail(expr.line, "input() has to be assigned once, for example len = input.int(14, \"Length\").");
  }
  fail(expr.line, `${name}() is not supported. No value was invented.`);
}
