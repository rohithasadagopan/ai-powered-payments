# CartMind — AI shopping assistant with PayPal checkout

Describe what you need in plain words ("a birthday gift for a coffee-loving friend under $60"). CartMind's AI picks the best products from the shop, explains why each fits, keeps the total under your budget, and lets you pay in one tap with **PayPal**.

## Features
- **Natural-language shopping** — type a need, a person, or a situation, plus an optional budget.
- **AI-curated picks** — 1–4 products with a personal reason for each and a short summary.
- **Budget guardrail** — budget is enforced by the AI *and* re-checked on the server.
- **Cart** — add AI picks in one click, adjust quantities.
- **PayPal checkout** — PayPal Smart Buttons (JS SDK) + PayPal **Orders v2 REST API** (create + capture) in Sandbox.
- **Receipt** — shows PayPal order ID, capture ID, status and payer name after capture.

## PayPal integration
| Piece | What it does |
|---|---|
| PayPal JavaScript SDK (`paypal.com/sdk/js`) | Renders PayPal Smart Payment Buttons in the cart |
| `POST /v1/oauth2/token` | Server gets an access token with client ID + secret |
| `POST /v2/checkout/orders` | Server creates the order; prices are recomputed from the catalog (never trusted from the browser) |
| `POST /v2/checkout/orders/{id}/capture` | Server captures the payment after buyer approval |

Code: `src/lib/paypal.server.ts`, `src/components/PayPalCheckout.tsx`, `src/lib/shop.functions.ts`.

## AI tools used
- **Lovable AI Gateway** with the **OpenAI `gpt-6-astra`** model via the **Vercel AI SDK** (`ai`, `@ai-sdk/openai`, Responses API).
- The model receives the product catalog + the shopper's request and budget, and returns JSON picks with reasons. The server validates every product ID and enforces the budget. Code: `src/lib/ai.server.ts`.
- Lovable (AI app builder) was used to scaffold and build the app; AI image generation produced the hero image.

## Tech stack
TanStack Start (React 19, Vite 7), Tailwind CSS v4, TypeScript, server functions running on Cloudflare Workers.

## Run locally
Requirements: [Bun](https://bun.sh) (or Node 20+ with npm).

```bash
git clone <this-repo>
cd <this-repo>
bun install
```

Create a `.env` file (or export the variables):
```
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
LOVABLE_API_KEY=your_lovable_ai_key
```
- PayPal sandbox keys: https://developer.paypal.com → Apps & Credentials → Sandbox → Create App.
- `LOVABLE_API_KEY`: from a Lovable project with AI enabled (or swap `src/lib/ai.server.ts` to any OpenAI-compatible endpoint).

```bash
bun run dev   # http://localhost:8080
```

## Try the demo
1. Click an example prompt or type your own, optionally set a budget, press **Ask**.
2. Add the AI picks to the cart.
3. Click the **PayPal** button and log in with a **sandbox personal (buyer) account** (developer.paypal.com → Sandbox → Accounts).
4. Approve — the app captures the payment and shows the receipt.

## License
MIT — see [LICENSE](./LICENSE).
