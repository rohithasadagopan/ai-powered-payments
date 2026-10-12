<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- AI calls live in `src/lib/ai.server.ts`, PayPal REST calls in `src/lib/paypal.server.ts`; client calls go through `src/lib/shop.functions.ts` server functions — keeps secrets server-side.
- PayPal order totals are always recomputed from `src/lib/catalog.ts` on the server — never trust browser prices.
