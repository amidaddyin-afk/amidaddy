# Conversion P0/P1 — Handover

Branch: `conversion/p0-p1-discovery-and-analytics` · Commit: `b3ebb42`
Base: `main` @ `607994b`

Everything here is on a branch. **Not deployed.** Build, typecheck, lint, and all 40 tests are green.

---

## 1. Audit (baseline, with evidence)

The commerce backend is sound — verified by reading source, not just the live site:

| Area                        | Finding                                                                                                                                                                                                                                                      | Evidence                                                                                                                   | Severity        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Payment verification        | Correct. Order marked `PAID` only after server-side HMAC signature check **and** a live Razorpay `payments/{id}` fetch confirming `captured` + exact amount/currency/order. Idempotent.                                                                      | `src/app/api/checkout/verify/route.ts`, `src/lib/orders.ts:markOrderPaid`, `src/lib/razorpay.ts:isMatchingCapturedPayment` | —               |
| Duplicate paid orders       | Prevented. `payment_order_id` / `payment_id` are unique; webhook events deduped in `webhook_events`; `markOrderPaid` no-ops if already paid.                                                                                                                 | schema `@unique`, `src/app/api/razorpay/webhook/route.ts`                                                                  | —               |
| Shipping vs coupon          | Correct. Free-shipping eligibility checked against **pre-coupon** subtotal, so a coupon can't cost an order its free delivery.                                                                                                                               | `src/lib/commerce.ts:shippingPaise` + comment; `tests/commerce.test.ts`                                                    | —               |
| Server-authoritative totals | Correct. `/api/checkout/quote` and `createPendingOrder` recompute price/stock/discount/shipping from the DB; client cart values are display-only.                                                                                                            | `src/lib/orders.ts`                                                                                                        | —               |
| Guest checkout              | Supported. Checkout form takes name/email/phone/address with no account requirement; a verified logged-in user's email is trusted over form input.                                                                                                           | `src/app/api/checkout/route.ts`, `src/components/CheckoutClient.tsx`                                                       | —               |
| **Analytics**               | **None existed.** No GA4, no dataLayer, no funnel. No way to measure conversion at all.                                                                                                                                                                      | grep: zero `gtag`/`dataLayer`/GA refs in `src/`                                                                            | **P0**          |
| Homepage hero               | Generic "Make it personal." Discovery combo buried ~7 sections down.                                                                                                                                                                                         | `src/app/page.tsx` before this branch                                                                                      | P1              |
| Unfinished content          | "Campaign photography for Heavenly is in production." rendered live in the story rail.                                                                                                                                                                       | `src/app/page.tsx` `house-story-pending`                                                                                   | P1              |
| Admin link in customer nav  | Footer showed an "Admin login" link (→ `/login?next=/admin`).                                                                                                                                                                                                | `src/components/Footer.tsx` before this branch                                                                             | P1              |
| Checkout success UX         | `handler` ignores the `/api/checkout/verify` response and always routes to `/checkout/success`. Not a paid-order bug (success page re-reads server order state and shows "Confirming payment" until `PAID`), but the client never surfaces a verify failure. | `src/components/CheckoutClient.tsx` `handler`                                                                              | P2 — left as-is |

No broken navigation, missing pages, or variant price/image desync found in code review. A full click-through on staging with Razorpay test keys is still recommended (see §5).

---

## 2. Implemented changes and why

### P0 — Measurement (GA4 funnel)

**Why:** you cannot improve first-purchase conversion without a funnel to measure it against. This is the prerequisite for every experiment below.

| File                                     | Change                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/analytics.ts` (new)             | Typed helper. One `track()` chokepoint (no-op until `gtag` exists). All money converted paise→₹ **once**, here. `currency: "INR"` on every ecommerce event. `stripPii()` drops `email`/`phone`/`name`/`address`/`postal_code`-type keys as a backstop. `toItem(product, size, qty)` builds a GA4 item from a catalog product. |
| `src/components/Analytics.tsx` (new)     | GA4 script loader. **Renders nothing unless `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set** — so local/preview traffic stays out of reporting with no extra config. Mounted in `src/app/layout.tsx`.                                                                                                                                 |
| `src/components/TrackedLink.tsx` (new)   | `<Link>` + one event on click, so server components can attach tracking without becoming client components.                                                                                                                                                                                                                   |
| `src/components/ViewItemList.tsx` (new)  | Fires `view_item_list` once for a server-rendered grid.                                                                                                                                                                                                                                                                       |
| `src/components/PurchaseEvent.tsx` (new) | Fires `purchase` from the confirmation page. Guarded by `sessionStorage` per order id; GA4 also dedupes on `transaction_id`.                                                                                                                                                                                                  |
| `src/context/CartContext.tsx`            | `add_to_cart` in `addItem`, `remove_from_cart` in `removeItem` — every surface routes through here, so this is the single wiring point.                                                                                                                                                                                       |
| `src/components/ProductCard.tsx`         | `select_item` on the product links.                                                                                                                                                                                                                                                                                           |
| `src/components/ProductDetail.tsx`       | `view_item` on mount and on size change.                                                                                                                                                                                                                                                                                      |
| `src/components/CheckoutClient.tsx`      | `begin_checkout` once when the page has a cart; `add_shipping_info` + `add_payment_info` on submit, just before the Razorpay sheet opens.                                                                                                                                                                                     |
| `src/app/checkout/success/page.tsx`      | Renders `<PurchaseEvent>` **only when `order.paymentStatus === "PAID"`** (server-verified). Item list, value (subtotal + shipping − discount), tax, shipping, coupon all from the DB order.                                                                                                                                   |
| `src/components/ScentFinder.tsx`         | `scent_finder_start` (after Q1), `scent_finder_complete` (on result), `scent_recommendation_click` (on the result CTA).                                                                                                                                                                                                       |
| `src/app/page.tsx`                       | `discovery_cta_click` with `location: hero                                                                                                                                                                                                                                                                                    | discovery_section | footer_cta`. |

**Events live now:** `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase`, `discovery_cta_click`, `scent_finder_start`, `scent_finder_complete`, `scent_recommendation_click`.
**Not yet wired:** `view_cart` (helper exists; cart is a slide-over `CartSidebar` — add an effect there when ready), `delivery_check` (no PIN checker), `support_click` (helper exists; add to `mailto:` links when support UX is revisited).

### P1 — Discovery-led homepage

**Why:** the hypothesis is that first-timers need an easier, lower-risk way to try four unfamiliar scents. Lead with that product.

- **Hero** (`src/app/page.tsx`): headline → _"Find your signature. Try all four."_; supporting line names the four scent families; **offer line `4 × 20ml · ₹699 · Free delivery`** with the price pulled from `comboVariant.pricePaise` and _"Free delivery"_ shown **only** when that clears `DEFAULT_FREE_SHIPPING_PAISE` (so it stays honest if either number changes). Primary CTA _"Shop the discovery combo"_ → combo PDP; secondary _"Help me choose a scent"_ → scent finder. No new carousel/video; existing hero poster kept.
- **Section order** now: hero → benefits strip → **discovery combo** → four singles grid → per-scent stories → brand/composition → sizes → scent finder → FAQ → closing CTA. The combo moved from ~7th to 1st content section. Individual fragrances remain one scroll below and fully shoppable.
- **FAQ**: combo answer reworded to _"It is a paid four-bottle set, not free samples."_

### P1 — Cleanup

- Removed _"Campaign photography for Heavenly is in production."_ from `src/app/page.tsx`. Heavenly keeps its product-photo story tile and its "Explore Heavenly" link; the `STORY` map lost its now-unused `art` flag.
- Removed the admin link from `src/components/Footer.tsx`. Admin access is unchanged: type `/admin`, middleware (`src/proxy.ts`) enforces auth + a 12h session cap. `tests/theme-tokens.test.ts` updated to assert the footer has **no** admin link.
- `.env.example` documents `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

---

## 3. Changed files & configuration

**New:** `src/lib/analytics.ts`, `src/components/{Analytics,TrackedLink,ViewItemList,PurchaseEvent}.tsx`, `tests/analytics.test.ts`, `docs/conversion-p0-p1-handover.md`
**Modified:** `src/app/{layout,page}.tsx`, `src/app/checkout/success/page.tsx`, `src/app/globals.css` (one `.house-hero-offer` rule), `src/components/{Footer,ProductCard,ProductDetail,CheckoutClient,ScentFinder}.tsx`, `src/context/CartContext.tsx`, `tests/theme-tokens.test.ts`, `.env.example`

**Config required to activate analytics:** set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in the **production** Vercel environment only (`vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production`). Leave it unset in Preview/Development so test traffic never reaches the property. No other config changes.

---

## 4. Screenshots

Not captured in this environment (`npm run start` forces HTTPS on localhost via `proxy.ts`; dev server renders correctly on `:3001`). Verified via HTML assertions instead — see §5. **Please capture desktop + mobile of `/` and `/products/signature-combo-20ml` on the preview deploy before merge.**

---

## 5. Test results & limitations

- `npm test` — **40/40 pass** (2 new in `tests/analytics.test.ts` for the paise→₹ + variant-pick math; 1 updated in `tests/theme-tokens.test.ts`).
- `npx tsc --noEmit` — clean.
- `npm run lint` — clean (one pre-existing unrelated warning in `src/lib/orders.ts`).
- `npm run build` — compiles, all routes render.
- Dev-server HTML assertions confirmed: new hero copy present, "Make it personal." gone, Heavenly production line gone, `next=/admin` count 0, section order `discovery-set` → `shop-100ml` → `shop-20ml`, offer line renders `4 × 20ml · ₹699 · Free delivery`, GA script absent when the env var is unset.

**Limitations / not verified here:** live Razorpay test-mode checkout run; real-device mobile layout; Lighthouse before/after; GA4 DebugView event validation (needs the property + a deploy).

---

## 6. Analytics validation checklist (do on the preview deploy)

1. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` on the preview env, redeploy.
2. GA4 → Admin → DebugView. Walk homepage → combo PDP → add to bag → checkout → Razorpay **test** payment → success.
3. Confirm each fires once with sane params: `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase`.
4. `purchase`: `transaction_id` = order id, `currency` `INR`, `value` = subtotal + shipping − discount, `items[]` populated. **Refresh the success page — no second `purchase`.**
5. Confirm no `email`/`phone`/`name`/`address` in any event payload.
6. Mark the GA4 property's data as "not for production reporting" until real key is on production, or use a separate debug property.

---

## 7. Blocked — needs assets or owner decisions

| Item                                                     | Blocker                                                                                                                                                                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heavenly campaign photography                            | Asset. Currently uses the product hero photo. Need campaign art or a photography brief sign-off.                                                                                   |
| Genuine customer reviews                                 | Decision + build. `TESTIMONIALS` is empty; no review system. Needs: verified-purchase logic, moderation policy, storage for photos. Scope separately — do not block checkout work. |
| PIN-code / COD serviceability checker                    | Integration. No courier API is wired. Without one, only show approved dispatch text — no fabricated dates. Confirm if a Shiprocket/Delhivery/Blue Dart account exists.             |
| WhatsApp support                                         | Approved business number + staffed process. Support email `support@amidaddy.in` is already in the footer.                                                                          |
| Brand/founder content on `/our-approach`                 | Facts. Who is behind the brand, how scents are developed, business identity. Need real info — will not invent a founder story.                                                     |
| Discovery→full-size credit                               | Economics sign-off: credit amount, eligible SKUs, validity, min spend, stacking rules. Design only until approved.                                                                 |
| Cart-recovery / post-delivery / review-request messaging | Consent + approval. Templates only; no outbound sends without opt-in, unsubscribe, frequency caps.                                                                                 |
| Campaign landing page + video briefs + creator pilot     | Marketing deliverables. Build after the homepage/PDP changes are live and the funnel is validated.                                                                                 |
| COD                                                      | Business approval — eligibility, charges, RTO economics. Do not enable.                                                                                                            |
| Price / MRP / shipping / discount changes                | Owner approval. This branch changed none.                                                                                                                                          |

---

## 8. Deploy & rollback

**Deploy:**

1. Open a PR from `conversion/p0-p1-discovery-and-analytics` → `main`. Vercel builds a preview.
2. On the preview: run §5 assertions + §6 analytics validation + a Razorpay test-mode checkout. Capture §4 screenshots.
3. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` on **production** env.
4. Merge. Vercel deploys `main` to production.
5. Post-deploy: one real low-value order (or test-mode) → confirm one `purchase` in GA4 realtime, order `PAID` in admin, confirmation email sent.

**Rollback:**

- Fastest: Vercel → Deployments → promote the previous production deployment (`607994b`). Instant, no rebuild.
- Or `git revert b3ebb42 && git push` → Vercel redeploys `main` without these changes.
- To disable **only** analytics while keeping the homepage changes: remove `NEXT_PUBLIC_GA_MEASUREMENT_ID` from production env and redeploy — the loader renders nothing, every `track()` call becomes a no-op.
- No DB migrations in this branch; nothing to roll back server-side.

---

## 9. Next-month experiment backlog

Each: **Hypothesis → change → primary metric → guardrail → decision rule.** No experiment starts before the GA4 funnel is validated (§6).

1. **Discovery-combo hero**
   H: leading with the ₹699 try-all-four offer lowers first-purchase friction vs the generic hero.
   Change: this branch (already built).
   Primary: homepage → `purchase` conversion rate (session-based).
   Guardrail: 100ml-single revenue per session must not drop >10%.
   Decision: ship permanently if conversion +≥15% rel. over 2 weeks and guardrail holds; else revert hero, keep section reorder.

2. **Combo PDP "how to test" block**
   H: an explicit "try separately, let it develop, compare over several wears" guide raises combo add-to-cart by setting expectations.
   Change: add the testing guide + "why buy 100ml later" to `/products/signature-combo-20ml`.
   Primary: combo PDP `view_item` → `add_to_cart` rate.
   Guardrail: combo PDP → any `add_to_cart` (combo or single) not lower.
   Decision: keep if +≥10% rel. over 2 weeks.

3. **Free-shipping progress line in cart**
   H: showing "₹X to free delivery" using the real ₹599 rule lifts AOV for sub-threshold carts.
   Change: progress line in `CartSidebar`/checkout from actual eligible total.
   Primary: AOV for carts that enter checkout below ₹599.
   Guardrail: checkout → `purchase` rate not lower (no added friction).
   Decision: keep if AOV +≥5% and guardrail holds.

4. **Scent-finder prominence**
   H: undecided visitors who complete the scent finder convert better; making it easier to start raises overall conversion.
   Change: already tracked (`scent_finder_start/complete`). Move it above the FAQ / add a second entry point.
   Primary: overall session → `purchase` rate.
   Secondary: `scent_finder_complete` → `purchase` vs non-users.
   Guardrail: bounce rate on `/` not up >5%.
   Decision: keep the more prominent placement if overall conversion +≥8%.

5. **PDP delivery-estimate copy**
   H: a concrete "dispatched in N business days" line near the buy button reduces PDP abandonment.
   Change: approved dispatch text (owner-supplied) beside the price on singles + combo PDP. No fabricated dates.
   Primary: PDP `view_item` → `begin_checkout` rate.
   Guardrail: support tickets about delivery timing not up.
   Decision: keep if +≥7% over 2 weeks.

No experiment here promises a sales increase. The goal is to remove measurable friction, make the offer explicit, and have a trustworthy funnel to judge the next change against.
