import { useEffect, useRef, useState } from "react";
import { captureOrder, createOrder } from "@/lib/shop.functions";

type Line = { id: string; qty: number };
export type Receipt = Awaited<ReturnType<typeof captureOrder>>;

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => { render: (el: HTMLElement) => Promise<void>; close: () => void };
    };
  }
}

let sdkPromise: Promise<void> | null = null;
function loadSdk(clientId: string) {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`;
    s.onload = () => resolve();
    s.onerror = () => {
      sdkPromise = null;
      reject(new Error("Could not load PayPal"));
    };
    document.body.appendChild(s);
  });
  return sdkPromise;
}

export function PayPalCheckout({
  clientId,
  lines,
  onPaid,
  onError,
}: {
  clientId: string;
  lines: Line[];
  onPaid: (r: Receipt) => void;
  onError: (msg: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let buttons: { close: () => void } | null = null;
    let cancelled = false;
    loadSdk(clientId)
      .then(() => {
        if (cancelled || !ref.current || !window.paypal) return;
        const b = window.paypal.Buttons({
          style: { layout: "vertical", shape: "pill", label: "pay", height: 44 },
          createOrder: async () => {
            const { id } = await createOrder({ data: { lines: linesRef.current } });
            return id;
          },
          onApprove: async (data: { orderID: string }) => {
            const r = await captureOrder({ data: { orderId: data.orderID } });
            onPaid(r);
          },
          onError: (err: unknown) => onError(err instanceof Error ? err.message : "PayPal error"),
        });
        buttons = b;
        ref.current.innerHTML = "";
        return b.render(ref.current).then(() => setReady(true));
      })
      .catch((e) => onError(e.message));
    return () => {
      cancelled = true;
      try {
        buttons?.close();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return (
    <div>
      {!ready && <div className="h-11 animate-pulse rounded-full bg-muted" />}
      <div ref={ref} />
    </div>
  );
}
