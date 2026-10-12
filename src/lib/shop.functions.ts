import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const recommend = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ query: z.string().trim().min(2).max(500), budget: z.number().positive().max(10000).nullable() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { recommendProducts } = await import("./ai.server");
    return recommendProducts(data.query, data.budget);
  });

export const getPaypalConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { paypalClientId } = await import("./paypal.server");
  return { clientId: paypalClientId() };
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ lines: z.array(z.object({ id: z.string().max(10), qty: z.number().int().min(1).max(10) })).min(1).max(20) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { createPaypalOrder } = await import("./paypal.server");
    return createPaypalOrder(data.lines);
  });

export const captureOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ orderId: z.string().max(40) }).parse(d))
  .handler(async ({ data }) => {
    const { capturePaypalOrder } = await import("./paypal.server");
    return capturePaypalOrder(data.orderId);
  });
