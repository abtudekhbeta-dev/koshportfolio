import { createFileRoute } from "@tanstack/react-router";
import { getSkillBoard, kickSkillBoard, putSkillRead } from "@/lib/kosh/skill-board.server";
import type { SkillRead } from "@/lib/kosh/screens";

export const Route = createFileRoute("/api/skill-board")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(getSkillBoard());
      },
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as Partial<SkillRead> & { kick?: boolean };
        if (body.kick) return Response.json(kickSkillBoard());
        const symbol = String(body.symbol || "")
          .replace(/\.(NS|BO)$/i, "")
          .toUpperCase();
        if (!symbol || !body.fundRating || !body.qualPotential) {
          return Response.json(getSkillBoard());
        }
        putSkillRead({
          symbol,
          name: String(body.name || symbol).slice(0, 80),
          sector: String(body.sector || "Other").slice(0, 40),
          fundTag: String(body.fundTag || "").slice(0, 40),
          fundRating: body.fundRating === "pass" ? "pass" : "fail",
          fundVerdict: String(body.fundVerdict || "").slice(0, 400),
          qualTag: String(body.qualTag || "").slice(0, 40),
          qualPotential: body.qualPotential === "yes" ? "yes" : "no",
          qualVerdict: String(body.qualVerdict || "").slice(0, 400),
          at: Number(body.at) || Date.now(),
        });
        return Response.json(getSkillBoard());
      },
    },
  },
});
