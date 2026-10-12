import { productById } from "./catalog";

const PAYPAL_API = "https://api-m.sandbox.paypal.com";

export type CartLine = { id: string; qty: number };

function creds() {
  const id = process.env["PAYPAL_CLIENT_ID"];
  const secret = process.env["PAYPAL_CLIENT_SECRET"];
  if (!id || !secret) throw new Error("PayPal is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.");
  return { id, secret };
}

async function accessToken() {
  const { id, secret } = creds();
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed [${res.status}]: ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

export async function createPaypalOrder(lines: CartLine[]) {
  // Price is always recomputed on the server from the catalog.
  const items = lines
    .map((l) => ({ p: productById(l.id), qty: Math.max(1, Math.min(10, Math.floor(l.qty))) }))
    .filter((x): x is { p: NonNullable<typeof x.p>; qty: number } => !!x.p);
  if (!items.length) throw new Error("Cart is empty.");
  const total = items.reduce((s, x) => s + x.p.price * x.qty, 0).toFixed(2);

  const token = await accessToken();
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description: "CartMind order",
          amount: {
            currency_code: "USD",
            value: total,
            breakdown: { item_total: { currency_code: "USD", value: total } },
          },
          items: items.map((x) => ({
            name: x.p.name,
            quantity: String(x.qty),
            unit_amount: { currency_code: "USD", value: x.p.price.toFixed(2) },
            category: "PHYSICAL_GOODS",
          })),
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`PayPal create order failed [${res.status}]: ${await res.text()}`);
  const data = (await res.json()) as { id: string };
  return { id: data.id };
}

export async function capturePaypalOrder(orderId: string) {
  if (!/^[A-Z0-9]{5,40}$/.test(orderId)) throw new Error("Invalid order id.");
  const token = await accessToken();
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`PayPal capture failed [${res.status}]: ${await res.text()}`);
  const data = (await res.json()) as {
    id: string;
    status: string;
    payer?: { name?: { given_name?: string }; email_address?: string };
    purchase_units?: { payments?: { captures?: { id: string; amount: { value: string } }[] } }[];
  };
  const cap = data.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    orderId: data.id,
    status: data.status,
    payerName: data.payer?.name?.given_name ?? null,
    payerEmail: data.payer?.email_address ?? null,
    captureId: cap?.id ?? null,
    amount: cap?.amount.value ?? null,
  };
}

export function paypalClientId() {
  return process.env["PAYPAL_CLIENT_ID"] ?? null;
}
