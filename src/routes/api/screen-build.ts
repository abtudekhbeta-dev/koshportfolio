import { createFileRoute } from "@tanstack/react-router";
import { executeScreenBuild } from "@/lib/kosh/ai.server";

const hits = new Map<string, number[]>();
function limited(id: string, max = 16, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(id) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(id, arr);
    return false;
  }
  arr.push(now);
  hits.set(id, arr);
  return true;
}

export const Route = createFileRoute("/api/screen-build")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
        if (!limited(ip)) return Response.json({ ok: false, error: "Too many screens. Try again in a few minutes." }, { status: 429 });
        const body = (await request.json().catch(() => ({}))) as { prompt?: string; image?: string };
        const image = String(body.image || "");
        if (image && !image.startsWith("data:image/")) {
          return Response.json({ ok: false, error: "Image must be a screenshot from this page." }, { status: 400 });
        }
        if (image.length > 1_200_000) return Response.json({ ok: false, error: "Screenshot is too large. Crop it and try again." }, { status: 400 });
        const result = await executeScreenBuild({
          prompt: String(body.prompt || "").slice(0, 1200),
          image: image || undefined,
        });
        return Response.json(result);
      },
    },
  },
});
