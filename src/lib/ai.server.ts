import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { CATALOG } from "./catalog";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";
const RUN_ID = "X-Lovable-AIG-Run-ID";

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId) headers.set(RUN_ID, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
    return res;
  };
}

export type Recommendation = {
  summary: string;
  picks: { id: string; reason: string }[];
};

export async function recommendProducts(query: string, budget: number | null): Promise<Recommendation> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured (missing LOVABLE_API_KEY).");

  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch(),
  });

  const catalog = CATALOG.map((p) => `${p.id} | ${p.name} | $${p.price} | ${p.category} | ${p.tags.join(", ")} | ${p.description}`).join("\n");

  const instructions = `You are CartMind, a friendly personal shopping assistant for a small store.
Only recommend products from this catalog (id | name | price | category | tags | description):
${catalog}

Rules:
- Pick 1 to 4 products that best fit the shopper's request.
- If a budget is given, the combined price of all picks must not exceed it.
- For each pick give a one-sentence, specific reason tied to the request.
- Write a warm 1-2 sentence summary.
Respond ONLY with JSON in this exact shape: {"summary": string, "picks": [{"id": string, "reason": string}]}`;

  const result = streamText({
    model: provider.responses(MODEL),
    instructions,
    messages: [{ role: "user", content: `Request: ${query}\nBudget: ${budget ? `$${budget}` : "none"}\nReturn json.` }],
    maxRetries: 0,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  } as Parameters<typeof streamText>[0]);

  const text = await result.text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("The assistant returned an unexpected answer. Please try again.");
  const parsed = JSON.parse(match[0]) as Recommendation;

  // Validate against catalog + enforce budget server-side
  const valid = new Set(CATALOG.map((p) => p.id));
  let picks = (parsed.picks ?? []).filter((p) => valid.has(p.id)).slice(0, 4);
  if (budget) {
    let total = 0;
    picks = picks.filter((p) => {
      const price = CATALOG.find((c) => c.id === p.id)!.price;
      if (total + price > budget) return false;
      total += price;
      return true;
    });
  }
  return { summary: String(parsed.summary ?? ""), picks };
}
