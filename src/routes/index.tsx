import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, Minus, Plus, ShoppingBag, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import hero from "@/assets/hero.jpg";
import { CATALOG, productById, type Product } from "@/lib/catalog";
import { getPaypalConfig, recommend } from "@/lib/shop.functions";
import { PayPalCheckout, type Receipt } from "@/components/PayPalCheckout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CartMind — AI shopping assistant with PayPal checkout" },
      { name: "description", content: "Describe what you need in plain words. CartMind's AI picks products within your budget and you pay securely with PayPal." },
      { property: "og:title", content: "CartMind — AI shopping assistant with PayPal checkout" },
      { property: "og:description", content: "Tell the AI what you need, get curated picks, check out with PayPal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const EXAMPLES = [
  "A birthday gift for a coffee-loving friend under $60",
  "Starting to run in the mornings, budget $150",
  "Make my work-from-home desk nicer",
  "Weekend hiking trip essentials",
];

type Pick = { product: Product; reason: string };

function Index() {
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [clientId, setClientId] = useState<string | null | undefined>(undefined);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    getPaypalConfig().then((c) => setClientId(c.clientId)).catch(() => setClientId(null));
  }, []);

  const ask = async (q = query) => {
    if (q.trim().length < 2) return;
    setQuery(q);
    setLoading(true);
    setSummary(null);
    setPicks([]);
    try {
      const b = parseFloat(budget);
      const r = await recommend({ data: { query: q, budget: Number.isFinite(b) && b > 0 ? b : null } });
      setSummary(r.summary);
      setPicks(r.picks.map((p) => ({ product: productById(p.id)!, reason: p.reason })));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const add = (id: string, d = 1) =>
    setCart((c) => {
      const n = Math.max(0, Math.min(10, (c[id] ?? 0) + d));
      const next = { ...c, [id]: n };
      if (!n) delete next[id];
      return next;
    });

  const lines = Object.entries(cart).map(([id, qty]) => ({ id, qty }));
  const total = lines.reduce((s, l) => s + (productById(l.id)?.price ?? 0) * l.qty, 0);

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <ShoppingBag className="size-4" />
          </span>
          <span className="font-display text-2xl">CartMind</span>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">PayPal Sandbox demo</span>
      </header>

      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl px-6">
        <div className="relative overflow-hidden rounded-2xl">
          <img src={hero} alt="Curated everyday products on linen" width={1600} height={1008} className="h-[540px] w-full object-cover sm:h-[420px]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/95 via-background/88 to-background/70 sm:bg-gradient-to-r sm:from-background/92 sm:via-background/72 sm:to-background/15" />
          <div className="relative flex h-full flex-col justify-center gap-5 p-8 md:p-12">
            <h1 className="max-w-lg font-display text-5xl leading-[1.05] md:text-6xl">
              Say what you need. <em className="text-primary">We'll fill the cart.</em>
            </h1>
            <p className="max-w-md text-muted-foreground">
              Describe the moment, the person or the problem. Our AI picks from the shop within your budget — then pay in one tap with PayPal.
            </p>
            <form
              className="flex max-w-xl flex-col gap-2 rounded-2xl border bg-card p-2 shadow-soft sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                ask();
              }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. a cozy gift under $50"
                className="flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-muted-foreground"
              />
              <div className="flex gap-2">
                <div className="flex items-center rounded-xl bg-muted px-3">
                  <span className="text-muted-foreground">$</span>
                  <input
                    value={budget}
                    onChange={(e) => setBudget(e.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="Budget"
                    inputMode="decimal"
                    className="w-20 bg-transparent px-1 py-2 outline-none"
                  />
                </div>
                <button
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                  Ask
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => ask(ex)} disabled={loading} className="rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground">
              {ex}
            </button>
          ))}
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_340px]">
        <div>
          {loading && (
            <div className="flex items-center gap-3 rounded-2xl border bg-card p-6 text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" /> Thinking about what fits you best…
            </div>
          )}
          {summary && (
            <div className="animate-rise mb-6 rounded-2xl bg-secondary p-6">
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-accent">Your AI picks</p>
              <p className="font-display text-2xl leading-snug">{summary}</p>
              {picks.length > 1 && (
                <button
                  onClick={() => picks.forEach((p) => !cart[p.product.id] && add(p.product.id))}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Add all to cart <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          )}
          {picks.length > 0 && (
            <div className="mb-12 grid gap-4 sm:grid-cols-2">
              {picks.map((p, i) => (
                <ProductCard key={p.product.id} p={p.product} reason={p.reason} inCart={!!cart[p.product.id]} onAdd={() => add(p.product.id)} delay={i * 80} />
              ))}
            </div>
          )}

          <h2 className="mb-4 font-display text-3xl">The whole shop</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {CATALOG.map((p) => (
              <ProductCard key={p.id} p={p} inCart={!!cart[p.id]} onAdd={() => add(p.id)} />
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            {receipt ? (
              <div className="animate-rise text-center">
                <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-success text-primary-foreground">
                  <Check className="size-6" />
                </span>
                <h3 className="font-display text-2xl">Payment complete</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Thanks{receipt.payerName ? `, ${receipt.payerName}` : ""}! ${receipt.amount} paid via PayPal.
                </p>
                <dl className="mt-4 space-y-1 rounded-xl bg-muted p-3 text-left text-xs">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Order</dt><dd className="font-mono">{receipt.orderId}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Capture</dt><dd className="font-mono">{receipt.captureId}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd>{receipt.status}</dd></div>
                </dl>
                <button onClick={() => setReceipt(null)} className="mt-4 text-sm font-medium text-primary hover:underline">
                  Keep shopping
                </button>
              </div>
            ) : (
              <>
                <h3 className="mb-3 flex items-center gap-2 font-display text-2xl">
                  <ShoppingBag className="size-5" /> Cart
                </h3>
                {lines.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Your cart is empty. Ask the AI above to get started.</p>
                ) : (
                  <>
                    <ul className="divide-y">
                      {lines.map((l) => {
                        const p = productById(l.id)!;
                        return (
                          <li key={l.id} className="flex items-center gap-2 py-3 text-sm">
                            <div className="flex-1">
                              <p className="font-medium">{p.name}</p>
                              <p className="text-muted-foreground">${p.price}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button aria-label="Decrease" onClick={() => add(l.id, -1)} className="rounded-md p-1 hover:bg-muted">
                                {l.qty === 1 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
                              </button>
                              <span className="w-5 text-center">{l.qty}</span>
                              <button aria-label="Increase" onClick={() => add(l.id, 1)} className="rounded-md p-1 hover:bg-muted">
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="my-4 flex justify-between border-t pt-4 font-medium">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    {clientId === undefined ? (
                      <div className="h-11 animate-pulse rounded-full bg-muted" />
                    ) : clientId ? (
                      <PayPalCheckout
                        clientId={clientId}
                        lines={lines}
                        onPaid={(r) => {
                          setReceipt(r);
                          setCart({});
                          toast.success("Payment captured");
                        }}
                        onError={(m) => toast.error(m)}
                      />
                    ) : (
                      <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">PayPal isn't connected yet — add sandbox keys to enable checkout.</p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </aside>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        CartMind · AI recommendations by Lovable AI · Payments via PayPal Orders v2 (Sandbox)
      </footer>
    </div>
  );
}

function ProductCard({ p, reason, inCart, onAdd, delay = 0 }: { p: Product; reason?: string; inCart: boolean; onAdd: () => void; delay?: number }) {
  return (
    <div style={{ animationDelay: `${delay}ms` }} className={`animate-rise flex flex-col rounded-2xl border bg-card p-5 ${reason ? "border-primary/40 shadow-soft" : ""}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{p.category}</span>
        <span className="font-display text-xl">${p.price}</span>
      </div>
      <h3 className="font-medium">{p.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
      {reason && <p className="mt-3 rounded-lg bg-secondary p-2.5 text-sm italic">“{reason}”</p>}
      <button
        onClick={onAdd}
        className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${inCart ? "bg-accent text-accent-foreground" : "bg-foreground text-background hover:opacity-90"}`}
      >
        {inCart ? <><Check className="size-4" /> In cart · add one more</> : <><Plus className="size-4" /> Add to cart</>}
      </button>
    </div>
  );
}
