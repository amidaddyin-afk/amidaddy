# AMIDADDY — FUTURE HEIRLOOM

## Complete cinematic storefront redesign and photography production plan

Prepared 5 September 2026. Planning deliverable only: no implementation or image generation is requested in this phase.

**Design read:** A futuristic fragrance house for buyers who want an original personal signature. Sculptural product photography, cinematic silver lighting, generous dark space and exceptionally direct shopping. The product feels worth discovering; the checkout feels effortless.

**Creative idea:** “A new signature. Entirely your own.”

**Brand position:** A small, self-directed perfume house with the ambition to change what people expect from fragrance. Communicate conviction through the formulation story, original scent identities and the quality of the experience. Avoid loud luxury imitation, borrowed prestige, invented awards and generic technology decoration.

This document is the implementation brief for a designer, developer, copywriter and image editor. It covers all four fragrances, eight individual size choices, both four-bottle sets, purchasing, supporting pages, every supplied image file and enhancement instructions.

## 1. How to use the paths and photo inventory

All `public/`, `productPics/`, `assets-source/` and `src/` paths below are relative to the repository root. This file lives at `docs/redesign/AMIDADDY-CINEMATIC-REDESIGN-PLAN.md`; from this file, repository-root assets are two directories up.

Example:

- Existing repository file: `public/products/detail/billionaire/hero.webp`.
- Existing browser URL: `/products/detail/billionaire/hero.webp`.
- Markdown link from this document: `../../public/products/detail/billionaire/hero.webp`.
- Editing source: use the named camera original where mapped; otherwise use the named existing WebP as an explicit fallback.
- Proposed enhanced output: `public/campaign/future-heirloom/...`. These outputs do not exist yet. Never treat a proposed path as an available asset.
- Do not rename or overwrite originals. Export new derivatives and preserve a source-to-output manifest.

The appendix enumerates every image in `productPics`, `assets-source` and `public`, plus app image assets. Every file has a role and a specific edit direction. “Reserve” means deliberately retained for a gallery or future campaign, not loaded into the landing page. Including every photograph in the inventory does not mean downloading every photograph for every visitor.

Visual reference sheets, with index numbers matching the inventories:

- [Existing web photography 1](contact-sheets/sheet-1.jpg), [2](contact-sheets/sheet-2.jpg), [3](contact-sheets/sheet-3.jpg), [4](contact-sheets/sheet-4.jpg).
- [Camera originals 1](contact-sheets/sources-1.jpg), [2](contact-sheets/sources-2.jpg), [3](contact-sheets/sources-3.jpg), [4](contact-sheets/sources-4.jpg).

All 124 existing WebP assets and the decodable camera originals were reviewed as contact sheets. Ten HEIC files could not be decoded in the available environment. They remain individually listed as **unassigned pending conversion and visual review**. Do not guess their fragrance, packaging or equivalence to a WebP from the filename alone.

## 2. Brand narrative and publishing rules

### The message hierarchy

1. **Original identity:** “A new signature. Entirely your own.”
2. **Experience:** “The first spray is only the beginning.”
3. **Formulation intent:** “Everything begins with what goes into the bottle.”
4. **Personal discovery:** “Four compositions. Find the one that feels like you.”
5. **Accessible entry:** “Start with 20ml. Make 100ml your everyday ritual.”
6. **Return-worthy experience:** “Made to become the bottle you reach for.”

Use “fragrances,” “compositions,” or “signatures,” not “flavours,” in customer-facing copy.

### Founder manifesto: publishable proposed copy

> We set out to make fragrance on our own terms. Original compositions, carefully chosen ingredients and an experience that earns its place in your everyday life. Our ambition is simple: to change what you expect from the bottle you reach for. Meet Amidaddy.

### Strong brand lines to distribute, not stack together

- Hero: “A new signature. Entirely your own.”
- Formulation: “Everything begins inside the bottle.”
- Scent evolution: “The first spray is only the beginning.”
- Discovery: “Meet all four. Let your skin decide.”
- Full collection: “Every side of you. In full size.”
- Closing: “Make room for your signature.”
- About: “We came here to create our own.”

### Claims that need evidence before publishing

The owner's brief is the creative direction, not a substitute for verified specifications. The statement about 80–90% alcohol is ambiguous: it might refer to competitors or the product. Do not turn it into a formulation percentage on the site.

| Proposed claim                                  | What must be established                                                              | Copy to use until then                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Minimal filler / mostly fragrance ingredients   | Formula, definitions of filler and fragrance concentration, manufacturer confirmation | “Our focus begins with the composition.”                         |
| Lower alcohol than other perfumes               | Own formula and a defined, supported comparison                                       | Omit comparison; explain the own formula only when verified.     |
| First in the market / industry pioneers         | A specific innovation, date, defined market and evidence of priority                  | “We set out to change what you expect from fragrance.”           |
| Best purity / unmatched purity                  | Definition, method and relevant independent results                                   | “Carefully chosen ingredients. Original compositions.”           |
| Lasts longer than everyone                      | Controlled comparative wear testing                                                   | “Discover how the composition develops on your skin.”            |
| You will never use another fragrance            | Cannot be a universal customer guarantee                                              | “Made to become the bottle you reach for.”                       |
| Bestseller / limited edition / verified reviews | Real sales ranking, actual limited run or actual purchaser reviews                    | Hide the badge or review block until the underlying data exists. |

Scent notes are olfactory descriptions; whiskey, ambergris and other note names do not automatically mean those materials are physically present. Label charts “Scent notes,” not “Our raw ingredients,” unless the formulation supports that wording. The styling roses in Old Love photography do not justify adding rose to its note list.

### Content corrections discovered in the catalog

The approved note arrays are a better copy source than the current short descriptions: Old Love's description mentions vanilla, which is absent from its note pyramid; Cold War's mentions musk, absent from its note pyramid. Replace those descriptions with the note-accurate copy in section 7. Validate source records together so every page remains consistent.

## 3. The full commercial collection

Prices below are the local catalog snapshot, not a promise of live production pricing. Render price, MRP, availability and offer calculations from the catalog service at runtime.

| Product                    | Route                             | Available size         | Local selling price | Local MRP | Presentation                                                          |
| -------------------------- | --------------------------------- | ---------------------- | ------------------: | --------: | --------------------------------------------------------------------- |
| Billionaire                | `/products/billionaire`           | 20ml                   |                ₹199 |      ₹249 | Current black travel bottle + matching carton                         |
| Billionaire                | `/products/billionaire`           | 100ml                  |              ₹1,199 |    ₹1,499 | Black full-size bottle; show current carton separately                |
| Cold War                   | `/products/coldwar`               | 20ml                   |                ₹199 |      ₹249 | Current blue travel bottle + matching carton                          |
| Cold War                   | `/products/coldwar`               | 100ml                  |              ₹1,199 |    ₹1,499 | Blue full-size bottle + blue carton                                   |
| Heavenly                   | `/products/heavenly`              | 20ml                   |                ₹199 |      ₹249 | Current pale travel bottle + matching carton                          |
| Heavenly                   | `/products/heavenly`              | 100ml                  |              ₹1,199 |    ₹1,499 | Pale gold full-size bottle + pale carton                              |
| Old Love                   | `/products/old-love`              | 20ml                   |                ₹199 |      ₹249 | Current red travel bottle + matching carton                           |
| Old Love                   | `/products/old-love`              | 100ml                  |              ₹1,199 |    ₹1,499 | Red full-size bottle + red carton                                     |
| Signature Discovery Combo  | `/products/signature-combo-20ml`  | 4 × 20ml, 80ml total   |                ₹699 |      ₹996 | All four travel fragrances; current outer packaging must be confirmed |
| Signature Collection Combo | `/products/signature-combo-100ml` | 4 × 100ml, 400ml total |              ₹4,299 |    ₹5,996 | All four full-size fragrances; show cartons actually included         |

**Packaging decision:** Current catalog singles point to `public/products/20ml/studio/`. Older photos show slim cylindrical travel bottles and a windowed gift box. These are not interchangeable. Use current studio singles as the 20ml purchase truth. Do not show the old gift box as an included item until fulfillment confirms that it is supplied. The latest four-travel-bottle photo is the first choice for the set; older box/model photos belong in the archive if packaging has changed.

Do not invent a two-bottle SKU just because a photograph contains two bottles. Do not show a group photograph as the primary image for a single 20ml item. Do not infer bottle capacity from apparent scale.

## 4. Visual system: Future Heirloom

### Art direction

A fragrance house from the near future: dark graphite architecture, controlled reflected light, clear glass, tangible surface texture and real bottle colors. No cyberpunk city, holographic dashboard, particle cloud, floating ingredient explosion, random neon or imitation of another perfume house.

Use a single dark theme consistently across marketing, shop, product, bag and checkout. The user's cinematic brief is the reason for this intentional fixed dark direction. Support high contrast and reduced motion; a manual lighter mode can be a separately designed future enhancement rather than accidental white sections.

| Token                | Value     | Role                                 |
| -------------------- | --------- | ------------------------------------ |
| Page                 | `#101413` | Dark green-neutral graphite          |
| Raised surface       | `#1A201E` | Forms, cart, quiet product panels    |
| Deep stage           | `#0C100F` | Photographic stage, not every panel  |
| Primary text         | `#F2F4EF` | Headings and body                    |
| Secondary text       | `#B5BDB7` | Description, metadata                |
| Border               | `#46514A` | Controls and meaningful dividers     |
| Single action accent | `#D4E5D6` | Primary buttons with `#101413` text  |
| Error                | `#F0A7A0` | Actual form and purchase errors only |

Bottle red, blue, pale gold and black remain true in photography. They are product identity, not four competing interface themes. Apply the same CTA color to every fragrance.

Typography: self-hosted **Space Grotesk** for display and **Manrope** for body. Use `next/font` or vetted local WOFF2 files; verify licenses before distributing local font binaries. Weight 400/500 for display, 400/500/600 for commerce. Keep words wide and readable. Desktop hero 64–88px with two lines maximum; mobile 40–48px. H2 40–60px desktop, 30–38px mobile; body 16–18px; controls at least 14px. Never put essential content in 10px technical-looking text.

Layout: maximum 1440px content width, 64–80px desktop gutters, 20px mobile gutters; 12-column desktop, 4-column mobile. Section spacing 88–128px desktop and 48–64px mobile. Sharp photography frames; 4px control corners; no floating pill labels. Header 72px desktop / 64px mobile with a 28–32px shipping announcement above it. One clear logo, not three competing wordmarks.

## 5. Technology and motion ownership

### Recommended stack

| Tool                                  | Decision                                                     | Exact responsibility                                                       |
| ------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Existing Next.js 16.3 + React         | Keep; read installed Next docs before implementation         | Server-rendered catalog and SEO, product URLs, routing, image delivery     |
| Tailwind CSS v4                       | Keep existing dependency                                     | Responsive layout and utilities; central semantic tokens using `@theme`    |
| Native CSS                            | Keep                                                         | Hover/focus, text layout, visual fallback, simple fades                    |
| Existing `framer-motion` 12.x         | Keep for this redesign; do not install `motion` alongside it | Cart, quantity feedback, quiz transitions and isolated UI leaves           |
| `gsap` + `@gsap/react`                | Add only during implementation                               | One isolated homepage cinematic chapter with ScrollTrigger; scoped cleanup |
| Lenis (`lenis`)                       | Optional final enhancement                                   | Desktop wheel smoothing only if native scrolling already performs well     |
| Existing Lucide                       | Keep one existing icon family                                | Bag, close, arrows, checks, search; no mixed icon packs                    |
| Existing `next/image` / `Photo`       | Keep                                                         | Responsive AVIF/WebP delivery, dimensions and blur placeholders            |
| Existing Sharp                        | Keep                                                         | Derivatives and contact sheets; never deliver camera originals to browsers |
| Existing cart/catalog/payment backend | Preserve                                                     | Stock, variants, GST, shipping, Razorpay, order integrity                  |
| Playwright + axe / Lighthouse         | Proposed QA tools, not installed by this plan                | Browser flow, accessibility and performance checks                         |

**Motion ownership:** GSAP owns only its isolated cinematic stage and descendants. Motion owns cart/quiz/UI components outside that subtree. Neither library writes to the other's nodes. No shared transform ownership. Start with native scroll; Lenis is not required for a cinematic site.

Optional implementation install command after checking current package versions: `npm install gsap @gsap/react`. Add `lenis` only after a measured prototype demonstrates benefit. This plan installs nothing.

Sources checked for this plan: [Tailwind theme variables](https://tailwindcss.com/docs/theme), [GSAP responsive animation cleanup](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/), [Motion reduced-motion hook](https://motion.dev/docs/react-use-reduced-motion), [Lenis official repository and GSAP integration](https://github.com/darkroomengineering/lenis). Tailwind supports shared theme variables. GSAP matchMedia scopes responsive setups and reverts them. Motion's reduced-motion hook supports replacing or removing movement. Lenis documents ScrollTrigger synchronization; follow that recipe rather than running two independent scroll clocks.

### Motion score

| Moment            | Desktop behavior                                                                       | Mobile / reduced motion                                        |
| ----------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| First paint       | Real poster visible immediately; copy opacity + 12px rise, 450ms                       | Same content immediately; reduced motion has no rise           |
| Hero bottle stage | One slow 1.035→1 scale settle over 1.2s                                                | Static photograph; no perpetual movement                       |
| Collection hover  | Image scale 1→1.025, 350ms; button state 160ms                                         | No hover dependency; controls always visible                   |
| Size selection    | Selected border/background updates immediately, image crossfade 180ms                  | Instant selection; preserve gallery geometry                   |
| Scent chapter     | At ≥1024px, one pin lasting at most 1.5 viewport heights, scrub 0.6; three note phases | Three normal stacked sections, no pin or horizontal hijack     |
| Editorial images  | Fade + 16px rise, once, 450ms                                                          | Fade or static; never delay product controls                   |
| Bag drawer        | 240ms horizontal entry + 160ms veil; trap focus                                        | Bottom sheet or full-width drawer; static under reduced motion |
| Checkout          | No decorative entrance, pin or smoothing                                               | Native scrolling and instant error focus                       |
| Navigation        | Optional 120–180ms crossfade after stable routing tests                                | No essential shared-element dependency                         |

For GSAP, use `start: 'top top'`, explicit end distance, scoped `useGSAP`, and matchMedia cleanup. Refresh after known image/font readiness, not every render. If Lenis is used, one owner drives its frame loop; synchronize ScrollTrigger, pause/destroy smoothing for dialogs and checkout, and preserve hash links, keyboard scrolling and back/forward restoration. Do not combine native CSS smooth scroll with Lenis.

No loader that blocks shopping, forced intro, scroll-jacking for the whole page, cursor replacement, purchase-button tilt, autoplay audio, autoplay carousel or canvas required to read content.

## 6. Homepage: every section, in order

The complete page is a film with shopping available before the story expands. Header links bypass the film. Use HTML text over photography, never generated text baked into a photo.

### H01. Announcement and navigation

Announcement: “Complimentary delivery on orders of ₹599 or more.” Render the threshold from commerce configuration.

Left: Amidaddy mark `public/brand/amidaddy-ad-signature-mark.png` (inspect contrast on dark and use a faithful light export if needed). Center: “Fragrances”, “Discovery sets”, “Our approach”, “Scent School”. Right: Search, Account, Bag count. Mobile: Menu, mark, Bag. Search should not take visual priority over shopping.

Nav destinations: `/shop`, `/#discovery-set`, `/#story`, `/scent-school`. Secondary menu links: “20ml”, “100ml”, “Full collection set”, “Track an order”. Keep existing anchors `#shop-100ml`, `#shop-20ml`, `#discovery-set`, `#scent-finder`, `#story` functional.

### H02. Cinematic hero: the complete house

- Source: `productPics/Product/only product/Ami Daddy0497_100ml_Combo_of_4.JPG`.
- Alternative existing web asset: `public/products/combos/100ml/01.webp`, which contains all four bottles with props. It is an alternative composition, not claimed to be the same source.
- Proposed exports: `public/campaign/future-heirloom/house-hero-desktop.webp` and `house-hero-mobile.webp`.
- Composition: all four bottles on a single dark reflective plane, occupying right 58% desktop. Preserve physical proportions, labels and original bottle colors. Keep left 38% low detail for text. Mobile gets a separate tall composition with bottles in the lower half and clear text space above.
- Eyebrow: “Original unisex fragrances”.
- H1: “A new signature. Entirely your own.”
- Body: “Four original compositions. Created to become the fragrance you reach for.”
- Primary CTA: “Find your signature” → `#shop-100ml`.
- Secondary text link: “Experience all four” → `#discovery-set`.
- Keep H1, both links and recognizable product photography visible at 1366×768 and 390×844. No full-screen film gate.

**Photo edit prompt H02:** “Edit the supplied photograph of the four Amidaddy 100ml bottles into a premium near-future fragrance campaign. Preserve exactly four original bottles, their labels, caps, proportions, order and red, pale gold, black and blue colors. Replace the pale studio background with graphite architecture and a subtle charcoal reflective floor. Use one wide silver light source and precise edge highlights. Keep credible contact shadows. Compose all bottles in the right 58 percent; leave the left 38 percent dark and visually quiet for live website text. Sophisticated photographic realism, restrained contrast, no neon, no added logo or copy, no invented packaging. Export a 16:9 desktop composition. Create a separate 4:5 mobile variation from the same source with all bottles fully visible and clean space above.”

### H03. Shop the four signatures

- Anchor: `#shop-100ml`.
- Heading: “Four compositions. One will feel like you.”
- Body: “Follow the notes that draw you in. Choose 20ml or 100ml right here.”
- Four equal product cells because these are comparable products, not generic feature cards.
- Each: exact product photograph, name, mood, three-note summary, 20ml/100ml selector, real price, MRP if valid, availability and “Add to bag”. Product name/photo links preserve selected size in the URL.
- 100ml visual choices: `public/products/detail/billionaire/01.webp`; `public/products/detail/coldwar/01.webp`; `public/products/detail/heavenly/02.webp`; for Old Love use new derivative of `productPics/Product/only product/Ami Daddy0474_100ml_oldLove.JPG`.
- 20ml visual choices: the four `public/products/20ml/studio/` singles listed in section 8.
- Each photograph gets a consistent 4:5 composition with bottle height 65–72% of frame. Use intentional new exports, not a blind center crop that cuts the bottle.
- Mobile: two columns only if all labels/controls meet touch and readability requirements; otherwise single-column cards. Buttons remain at least 44px tall. No horizontal carousel hiding half the range.

### H04. A belief made tangible

- Anchor: `#story`.
- Heading: “Everything begins inside the bottle.”
- Body: “Our focus is the composition: carefully chosen ingredients, a character of its own, and a fragrance that becomes part of your day.”
- Founder statement: “We came here to create our own.”
- Secondary body: “Amidaddy is built around original scent identities. Explore the notes, wear them on your skin, and decide what feels like you.”
- Image: `productPics/Product/Billionaire/Ami Daddy3416.JPG`, existing related export `public/products/detail/billionaire/02.webp`.
- Art: close, tactile cap/glass/label detail with real material texture. Photograph illustrates product craft, not an actual factory process.
- CTA: “Explore our approach” → proposed `/our-approach` page.
- Do not invent a laboratory, extractor, supplier, perfumer portrait or certificate as evidence.

### H05. The fragrance unfolds

- Heading: “The first spray is only the beginning.”
- Single optional cinematic pin; Billionaire is the demonstration, explicitly labeled “Billionaire, a closer look”.
- Opening image: `public/products/detail/billionaire/01.webp`. Copy: “An opening of whiskey notes.”
- Heart image: `public/products/detail/billionaire/02.webp`. Copy: “Spice, cinnamon and coriander come forward.”
- Base image: `public/products/detail/billionaire/03.webp`. Copy: “Tobacco, woods and resin shape the dry-down.”
- Display note phases as descriptive progression, not exact time stamps or a scientific simulation.
- CTA remains “Explore Billionaire” → `/products/billionaire?size=100ml`.
- Mobile: three simple image/text blocks; “Shop Billionaire” link after the first block as well as access through sticky global shop navigation.

### H06. 20ml singles: an easy first encounter

- Anchor: `#shop-20ml`.
- Heading: “Start small. Find something lasting.”
- Body: “Your chosen composition in a travel-ready 20ml bottle. An easy place to begin.”
- A compact row of four 20ml-only purchase cells with names and live prices. Do not repeat the lengthy H03 descriptions.
- Use `public/products/20ml/studio/billionaire.webp`, `cold-war.webp`, `heavenly.webp`, `old-love.webp`.
- Exact button copy: “Add 20ml to bag”.
- Tell the shopper this is a single bottle. A photograph of three matching bottles must not be the primary image here.

### H07. Discovery set: all four, 4 × 20ml

- Anchor: `#discovery-set`.
- Heading: “Meet all four. Let your skin decide.”
- Body: “Billionaire, Cold War, Heavenly and Old Love. Four 20ml fragrances, ready to discover at your own pace.”
- Primary image: `public/products/combos/20ml/latest-pack-of-4.webp`.
- Matching source candidate confirmed visually: `productPics/new_photos_for catalouge_20ml/combo4_20ml.png`; use the larger original after resolution inspection.
- Secondary image: `public/products/20ml/studio/pack-of-4.webp`.
- Price: runtime catalog; local snapshot ₹699. Label: “4 × 20ml / 80ml total”.
- Primary CTA: “Add the discovery set”. Secondary: “See what is included” → combo product page.
- No promise of a window gift box until current packaging is confirmed.

**Photo edit prompt H07:** “Retouch the provided four-bottle travel collection photograph for the Amidaddy Future Heirloom campaign. Preserve the four current travel bottles, label text, cap shapes and exact blue, pale, black and red colors. Retain their actual orientation. Replace the pale background with a graphite tabletop and softly illuminated dark wall. Add believable silver rim lighting and restrained reflections. Do not add cartons, a gift box, ribbons, extra bottles or a pedestal that covers volume labels. Make a 3:2 image with comfortable negative space around the collection and a separate 4:5 mobile composition.”

### H08. Full collection: all four, 4 × 100ml

- Heading: “Every side of you. In full size.”
- Body: “A full fragrance wardrobe: all four Amidaddy signatures in 100ml bottles. Choose the scent that fits the day ahead.”
- Primary: `public/products/combos/100ml/02.webp`; source `productPics/Product/100ml packof4/Ami Daddy0539_100ml_Combo_of_4.JPG`.
- Packaging: `public/products/combos/100ml/03.webp`; source `productPics/Product/100ml packof4/Ami Daddy0577_100ml_Combo_of_4.JPG`.
- Label: “4 × 100ml / 400ml total”. Live price; snapshot ₹4,299.
- CTA: “Add the full collection”. Secondary: “View the collection set” → `/products/signature-combo-100ml`.
- Different composition from H07: wide full-bleed photograph with text below, not another identical split panel.

**Photo edit prompt H08:** “Preserve the four Amidaddy 100ml bottles and their authentic scale in the supplied stepped-podium photograph. Refinish only the surroundings into matte graphite plinths with softly lit edges and a deep architectural background. Keep red Old Love, pale gold Heavenly, black Billionaire and blue Cold War recognizable. Reflections should be physically plausible. Do not alter bottle geometry, duplicate items or invent bundle packaging. Keep every cap visible. Compose a wide 16:9 campaign image with no generated text.”

### H09. The human experience

- Heading: “A fragrance becomes personal when you wear it.”
- Body: “Find the feeling that belongs to you. Powerful, fresh, soft or warm: every composition is unisex.”
- Two-image editorial spread: `public/gallery/old-love/05.webp` with `public/gallery/heavenly/11.webp`.
- Optional alternate for later campaign rotation: `public/gallery/billionaire/04.webp` with `public/gallery/coldwar/02.webp`.
- The model photographs are brand campaigns, not customer testimonials.
- CTA: “Find your scent” → `#scent-finder`.

### H10. Scent finder

- Anchor: `#scent-finder`.
- Heading: “What do you want to feel?”
- Intro: “Three questions. A place to start.”
- Q1: “Which notes draw you in?” Choices: “Woods and spice”, “Fresh fruit and herbs”, “Vanilla and florals”, “Amber and resin”.
- Q2: “When will you wear it most?” Choices: “Daytime”, “Evenings”, “A little of both”.
- Q3: “How would you describe your mood?” Choices: “Bold”, “Composed”, “Soft”, “Warm”.
- Match weights: notes 3 points, mood 2, occasion 1. Ties show two choices; no made-up match percentage.
- Results: “Start with {name}.” + exact three-note line + both size choices + live price + “Add to bag”. “Still curious? Experience all four” links to the discovery set.
- Images: selected size's product asset, never a random editorial portrait. No email wall.

### H11. Wear and care

- Heading: “Make it your ritual.”
- Three concise instructions: “Spray lightly onto pulse points.” / “Let the fragrance settle without rubbing.” / “Store away from direct sunlight and heat.”
- Image: `public/products/detail/heavenly/hero.webp`, illustrating both formats. Clearly a campaign image, not proof of current travel packaging.
- Use this image only as a secondary story visual if its older cylindrical 20ml bottle differs from current stock. Preferred future export: crop the 100ml bottle only or use `public/products/detail/heavenly/02.webp`.
- CTA: “Learn about fragrance” → `/scent-school`.

### H12. Questions before the first spray

Heading: “Before it becomes yours.”

- **Are these original fragrances?** “Amidaddy creates its own scent identities. Explore each composition's notes to find the one that feels right for you.”
- **Are they unisex?** “Yes. Choose by the notes and mood you enjoy.”
- **Is 20ml the same fragrance as 100ml?** “Yes. Both sizes carry the same composition; choose the format that fits your routine.”
- **How long will it last?** “Wear varies with skin, weather and application. Check the individual fragrance page for its verified wear information.”
- **What comes in a set?** “The discovery set contains four 20ml fragrances. The full collection contains four 100ml fragrances. Each includes Billionaire, Cold War, Heavenly and Old Love.”
- **What does delivery cost?** Render the current ₹99 fee / ₹599 free-shipping threshold from commerce settings; link the shipping policy.
- **Can I return it?** “Read our returns policy for eligibility, time limits and how to request help.” Do not rephrase policy terms into a broader guarantee.

### H13. Customer experiences, conditional

Insert above FAQs only when real reviews exist. Heading: “Worn. Remembered. Reviewed.” Show genuine quote, actual name as consented, purchased fragrance and truthful verification status. No seeded five-star cards. If no real reviews exist, omit the entire section without a blank container.

### H14. Final invitation and footer

- Heading: “Make room for your signature.”
- CTA: “Shop the collection” → `/shop`.
- Footer line: “Original compositions. Personal signatures.”
- Links: Shop; 20ml; 100ml; both sets; Our approach; Scent School; Account; Track order; Contact/support; all five existing policies; privacy preferences where applicable.
- No newsletter field unless a working subscription, confirmation and unsubscribe flow exists. If used: “Occasional notes from Amidaddy.” / “New compositions and stories, sent only when there is something to share.” / “Subscribe”.

---

# PART TWO — Fragrance briefs, every page, friction budget and the full image inventory

Prepared 5 September 2026. Same rules as Part One: planning only, no code, no image generation. All paths are repository-root relative. From this file, root assets are two directories up (`../../public/...`). A proposed export path (`public/campaign/future-heirloom/...`) does not exist yet — never treat it as an available asset. Do not rename or overwrite originals; export derivatives and keep a source-to-output manifest.

Part Two closes the two forward references in Part One (per-fragrance copy was "section 7", the 20ml studio list was "section 8") and adds every page that is not the homepage: product detail, shop, both combo pages, the bag drawer, checkout, and the supporting pages. It ends with the complete image inventory — every file in `public/` and `productPics/`, each with a role and an edit action.

## 7. Edit recipes (referenced everywhere below)

Eight named recipes. Each image in the plan points at one of these plus a one-line delta, so the retoucher works from a fixed vocabulary instead of 200 loose paragraphs. All eight sit inside the Future Heirloom art direction from Part One section 4: graphite architecture, one wide silver light source, real bottle colours (red Old Love, blue Cold War, pale gold Heavenly, black Billionaire), credible contact shadows, restrained contrast. Never: neon, particle clouds, holographic UI, added logos, baked-in text, invented packaging, altered bottle geometry, duplicated bottles.

| ID     | Use                                                                                 | Prompt core                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E1** | Single 100ml bottle — PDP hero, shop card                                           | "Place the supplied single bottle on a charcoal reflective floor against graphite architecture. One wide silver light from upper left, precise edge highlight down the glass, believable contact shadow. Preserve label text, cap shape, fill level and the bottle's true colour exactly. Compose 4:5 with the bottle 66–70% of frame height, generous dark space above and right for live web text. Photographic realism, restrained contrast, no added copy or props."                                             |
| **E2** | Four bottles together — combo hero, homepage house shot                             | "Arrange the four supplied bottles on one dark reflective plane in graphite architecture. Keep exactly four bottles, their order, labels, caps, proportions and the four true colours. One wide silver key light, subtle rim light per bottle, plausible reflections. Desktop 16:9 with the group in the right 58% and the left 38% dark and quiet. Also export a 4:5 mobile frame with all four fully visible and clear space above. No cartons, ribbons, pedestals or extra bottles unless present in the source." |
| **E3** | Macro — cap, collar, glass shoulder, label weave — the "how it unfolds" beats       | "Tight macro crop of the supplied bottle detail. Raking silver light to reveal real surface texture — glass, metal, print. Keep the true colour and any visible label text sharp. Square or 4:5. Deep graphite background falloff. No text, no colour grade beyond gentle contrast."                                                                                                                                                                                                                                 |
| **E4** | Editorial / model campaign frames                                                   | "Grade the supplied model photograph into the Future Heirloom world: graphite surroundings, filmic silver light, true skin tones, natural texture — no plastic beauty retouch. Keep any visible bottle's colour and label honest. Export 4:5 portrait and a 3:2 crop. No added product that is not in the frame, no invented text."                                                                                                                                                                                  |
| **E5** | Single 20ml travel bottle — PDP hero and card for the small size                    | "Same treatment as E1 for the supplied single 20ml travel bottle. This is ONE bottle: do not add a second or third. Keep the travel-bottle proportions and label honest. 4:5, bottle 60–66% of frame height, quiet dark space for web text."                                                                                                                                                                                                                                                                         |
| **E6** | Horizontal note strips (`public/ingredients/*-notes.webp`)                          | "Rebuild the background of the supplied note strip as a graphite gradient with soft silver falloff. Keep each note illustration and its label legible and in order. Keep the strip's wide aspect (about 4:1). Header text must read 'Scent notes', never 'ingredients'."                                                                                                                                                                                                                                             |
| **E7** | In-hand / on-desk / packed lifestyle frames                                         | "Retouch the supplied lifestyle frame into a muted graphite environment with soft daylight. Product label and colour stay legible and true. Keep it believable, not staged-luxury. 4:5 and 1:1 crops."                                                                                                                                                                                                                                                                                                               |
| **E8** | **Archive — do not ship.** Older cylindrical 20ml bottles and the windowed gift box | No edit. Hold in `assets-source/archive/`. Do not publish as a current product or an included item until fulfilment confirms that packaging ships today.                                                                                                                                                                                                                                                                                                                                                             |

## 8. Fragrance briefs — copy, notes and photo map

### 8.0 Rules for all four

- Notes shown on every surface come from the approved pyramid in `src/lib/data.ts` via `deriveNotes()`. Do not hand-write a shorter note line per page.
- The summary line is always `top[0] · heart[0] · base[0]`.
- Replace the current one-line `description` for Old Love and Cold War with the note-accurate copy below (Part One section 2: Old Love's live description names vanilla that is not in its pyramid; Cold War's names musk that is not in its pyramid).
- Every fragrance is unisex. Never split copy by gender.
- One CTA colour (`#D4E5D6`) on every fragrance. Bottle colour is identity, not a UI theme.
- Both sizes carry the same composition. Say so once per page, in the FAQ.

### 8.1 Billionaire — `/products/billionaire`

**Profile:** Woody Eau de Parfum · Intensity 4 · Wears 8–10 hours · Night, dates, events, formal occasions.
**Notes (authoritative):** Whiskey · Spicy notes · Tobacco. Full pyramid — top: whiskey; heart: spicy notes, cinnamon, coriander; base: tobacco, agarwood (oud), incense, sandalwood, patchouli, benzoin, vanilla, cedar.
**Bottle:** black.

- **PDP kicker:** "Unisex · Woody Eau de Parfum"
- **Name / story line:** Billionaire — "Power without explanation."
- **Description (keep):** "Polished cedarwood, amber and spice with a commanding warmth."
- **One-line for cards:** "Whiskey, spice and tobacco — warmth that does not raise its voice."
- **PDP intro paragraph:** "Billionaire opens on a warm whiskey note, then spice — cinnamon, coriander — settles in. The dry-down is tobacco, oud and resin: the part people remember after you have left the room."
- **Character chips:** Woody · Powerful · Sophisticated · Magnetic

**100ml photo map**

| Slot                         | File                                                             | Recipe | Delta                                                                                                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PDP hero                     | `public/products/detail/billionaire/hero.webp`                   | E1     | Warm-neutral grade; black glass must keep detail against graphite — lift shadow just enough to read the shoulder. Source original: `productPics/Product/Billionaire/Ami Daddy3348.JPG`. |
| PDP object (beside buy rail) | `public/products/detail/billionaire/01.webp`                     | E3     | Cap and collar macro.                                                                                                                                                                   |
| Unfold — opening             | `public/products/detail/billionaire/01.webp`                     | E3     | Caption "An opening of whiskey notes."                                                                                                                                                  |
| Unfold — heart               | `public/products/detail/billionaire/02.webp`                     | E3     | Caption "Spice, cinnamon and coriander come forward."                                                                                                                                   |
| Unfold — trail               | `public/products/detail/billionaire/03.webp`                     | E3     | Caption "Tobacco, woods and resin shape the dry-down."                                                                                                                                  |
| Shop card (100ml)            | `public/products/detail/billionaire/01.webp`                     | E1     | 4:5, bottle 66–72% of frame.                                                                                                                                                            |
| Homepage H04 "belief" image  | `productPics/Product/Billionaire/Ami Daddy3416.JPG` → new export | E3     | Tactile cap/glass/label detail. Existing related export: `public/products/detail/billionaire/02.webp`.                                                                                  |
| Homepage H05 cinematic pin   | `public/products/detail/billionaire/01.webp` → `02` → `03`       | E3     | The three beats above.                                                                                                                                                                  |
| Note strip                   | `public/ingredients/billionaire-notes.webp`                      | E6     | Header "Scent notes".                                                                                                                                                                   |
| Editorial (H09 rotation)     | `public/gallery/billionaire/04.webp`                             | E4     | Pair with Cold War for the alternate spread.                                                                                                                                            |
| Gallery reserve              | `public/gallery/billionaire/01–03, 05–11.webp`                   | E4     | PDP "more" grid and future campaign only; not loaded on first paint.                                                                                                                    |

**20ml photo map**

| Slot                        | File                                           | Recipe | Delta                                                                                            |
| --------------------------- | ---------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| PDP hero (size=20ml)        | `public/products/20ml/studio/billionaire.webp` | E5     | One travel bottle. Source: `productPics/Product/20ml single/Ami Daddy0617_20ml_Billionaire.JPG`. |
| Card (20ml row / H06)       | `public/products/20ml/studio/billionaire.webp` | E5     | Same. Button copy "Add 20ml to bag".                                                             |
| Angle set (PDP thumb strip) | `public/products/20ml/billionaire/01–04.webp`  | E5     | Keep as a 4-thumb strip; crop consistent.                                                        |
| Alt                         | `public/products/20ml/billionaire.webp`        | E5     | Fallback only.                                                                                   |

### 8.2 Cold War — `/products/coldwar`

**Profile:** Fresh Eau de Parfum · Intensity 3 · Wears 6–8 hours · Day and office.
**Notes (authoritative):** Plum · Pepper · Oakmoss. Full pyramid — top: plum, bergamot, mandarin orange; heart: pepper, juniper, thyme, tarragon; base: oakmoss, cedar, sandalwood.
**Bottle:** blue.

- **PDP kicker:** "Unisex · Fresh Eau de Parfum"
- **Story line:** Cold War — "Freshness with an edge."
- **Description (replace — the live one names musk, which is not in the pyramid):** "Cold plum and citrus over pepper and juniper, drying down to oakmoss and cedar. Clean, but not soft."
- **One-line for cards:** "Cold plum, pepper and oakmoss — fresh, controlled, a little severe."
- **PDP intro paragraph:** "Cold War opens sharp: plum, bergamot, mandarin. Pepper and juniper keep it from turning sweet. It ends dry — oakmoss, cedar — the kind of fresh that reads as composure rather than soap."
- **Character chips:** Fresh · Cold · Clean · Controlled

**100ml photo map**

| Slot                           | File                                               | Recipe | Delta                                                                                                                                  |
| ------------------------------ | -------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| PDP hero                       | `public/products/detail/coldwar/hero.webp`         | E1     | Cool grade; keep blue glass true, do not push cyan. Source: `productPics/Product/Cold War/Ami Daddy0122.JPG`.                          |
| PDP object                     | `public/products/detail/coldwar/01.webp`           | E3     | Collar / spray-head macro.                                                                                                             |
| Unfold opening / heart / trail | `public/products/detail/coldwar/01 / 02 / 03.webp` | E3     | Captions: "Plum, bergamot and mandarin, cold at first." / "Pepper and juniper hold the centre." / "Oakmoss and cedar in the dry-down." |
| Shop card (100ml)              | `public/products/detail/coldwar/01.webp`           | E1     | 4:5.                                                                                                                                   |
| Note strip                     | `public/ingredients/coldwar-notes.webp`            | E6     | Header "Scent notes".                                                                                                                  |
| Editorial (H09 alt)            | `public/gallery/coldwar/02.webp`                   | E4     | Pair with Billionaire.                                                                                                                 |
| Gallery reserve                | `public/gallery/coldwar/01, 03–10.webp`            | E4     | PDP "more" grid / future campaign.                                                                                                     |

**20ml photo map**

| Slot                  | File                                        | Recipe | Delta                                                                     |
| --------------------- | ------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| PDP hero (size=20ml)  | `public/products/20ml/studio/cold-war.webp` | E5     | Source: `productPics/Product/20ml single/Ami Daddy0612_20ml_Coldwar.JPG`. |
| Card (20ml row / H06) | `public/products/20ml/studio/cold-war.webp` | E5     | "Add 20ml to bag".                                                        |
| Angle set             | `public/products/20ml/cold-war/01–04.webp`  | E5     | 4-thumb strip.                                                            |
| Alt                   | `public/products/20ml/cold-war.webp`        | E5     | Fallback.                                                                 |

### 8.3 Heavenly — `/products/heavenly`

**Profile:** Floral Eau de Parfum · Intensity 3 · Wears 7–9 hours · Everyday and celebrations.
**Notes (authoritative):** Vanilla orchid · Tonka bean · Brown sugar. Full pyramid — top: Madagascar vanilla orchid, jasmine; heart: Brazilian tonka bean, vanilla, vanilla absolute; base: brown sugar, tonka bean absolute, vanilla orchid, amberwood, musk, patchouli.
**Bottle:** pale gold.

- **PDP kicker:** "Unisex · Floral Eau de Parfum"
- **Story line:** Heavenly — "Soft enough to draw someone closer."
- **Description (keep):** "A luminous floral musk that moves softly from day into evening."
- **One-line for cards:** "Vanilla orchid, tonka and brown sugar — warm, close, quietly floral."
- **PDP intro paragraph:** "Heavenly opens on vanilla orchid and jasmine, then tonka and vanilla absolute settle in. Brown sugar and musk in the base keep it soft and close to the skin — a scent people notice when they are already near you."
- **Character chips:** Floral · Soft · Intimate · Ethereal

**100ml photo map**

| Slot                           | File                                                                 | Recipe | Delta                                                                                                                                                                                                                                                               |
| ------------------------------ | -------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PDP hero                       | `public/products/detail/heavenly/hero.webp`                          | E1     | If this frame shows the older cylindrical 20ml bottle, crop to the 100ml only or use `public/products/detail/heavenly/02.webp` (Part One H11 note). Warm-gold grade, do not blow the pale glass to white. Source: `productPics/Product/Heavenly/Ami Daddy0027.JPG`. |
| PDP object                     | `public/products/detail/heavenly/02.webp`                            | E3     | Shoulder / label macro.                                                                                                                                                                                                                                             |
| Unfold opening / heart / trail | `public/products/detail/heavenly/01 / 02 / 03.webp`                  | E3     | Captions: "Vanilla orchid and jasmine open it." / "Tonka bean and vanilla absolute at the heart." / "Brown sugar and musk in the trail."                                                                                                                            |
| Homepage hero (wide/mobile)    | `public/hero/heavenly-wide.webp`, `public/hero/heavenly-mobile.webp` | E1     | Already sized for the two breakpoints — regrade to Future Heirloom only.                                                                                                                                                                                            |
| Homepage landing feature       | `public/landing/heavenly-main.webp`                                  | E1/E7  | Source: `productPics/landingPagePics/Heavenly_MainPage2.JPG`.                                                                                                                                                                                                       |
| Homepage H11 wear & care       | `public/products/detail/heavenly/02.webp`                            | E3     | Preferred over `hero.webp` if the hero shows old packaging.                                                                                                                                                                                                         |
| Shop card (100ml)              | `public/products/detail/heavenly/02.webp`                            | E1     | Part One H03 already specifies `02` for Heavenly.                                                                                                                                                                                                                   |
| Note strip                     | `public/ingredients/heavenly-notes.webp`                             | E6     | Header "Scent notes".                                                                                                                                                                                                                                               |
| Editorial (H09 primary)        | `public/gallery/heavenly/11.webp`                                    | E4     | Pair with Old Love `05`.                                                                                                                                                                                                                                            |
| Gallery reserve                | `public/gallery/heavenly/01–10, 12–13.webp`                          | E4     | PDP "more" grid / campaign.                                                                                                                                                                                                                                         |

**20ml photo map**

| Slot                  | File                                        | Recipe | Delta                                                                      |
| --------------------- | ------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| PDP hero (size=20ml)  | `public/products/20ml/studio/heavenly.webp` | E5     | Source: `productPics/Product/20ml single/Ami Daddy0609_20ml_Heavenly.JPG`. |
| Card (20ml row / H06) | `public/products/20ml/studio/heavenly.webp` | E5     | "Add 20ml to bag".                                                         |
| Angle set             | `public/products/20ml/heavenly/01–04.webp`  | E5     | 4-thumb strip.                                                             |
| Alt                   | `public/products/20ml/heavenly.webp`        | E5     | Fallback.                                                                  |

### 8.4 Old Love — `/products/old-love`

**Profile:** Amber Eau de Parfum · Intensity 4 · Wears 8–9 hours · Date night and cool weather.
**Notes (authoritative):** Saffron · Amber · Fir resin. Full pyramid — top: saffron, mango, jasmine; heart: amber, sugar, ambergris; base: fir resin, ambroxan, cedarwood, oakmoss.
**Bottle:** red.

- **PDP kicker:** "Unisex · Amber Eau de Parfum"
- **Story line:** Old Love — "A memory you never completely forgot."
- **Description (replace — the live one names vanilla, which is not in the pyramid):** "Saffron and mango over amber and resin, with ambroxan and cedar in the base. Warm, nostalgic, a little dark."
- **One-line for cards:** "Saffron, amber and fir resin — warm and nostalgic, built for cold weather."
- **PDP intro paragraph:** "Old Love opens on saffron and mango, bright for a moment. Then amber, sugar and ambergris pull it warm and low. Fir resin, ambroxan and cedar hold the base — the kind of scent that reads as a memory rather than a first impression."
- **Character chips:** Amber · Nostalgic · Romantic · Warm
- **Note:** The styling roses in Old Love photography do not justify adding rose to the note list (Part One section 2).

**100ml photo map**

| Slot                           | File                                                                                 | Recipe | Delta                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| PDP hero                       | `public/products/detail/old-love/hero.webp`                                          | E1     | Deep warm grade; keep red glass true, not orange. Source: `productPics/Product/only product/Ami Daddy0474_100ml_oldLove.JPG`.                     |
| PDP object                     | `public/products/detail/old-love/01.webp`                                            | E3     | Cap macro.                                                                                                                                        |
| Unfold opening / heart / trail | `public/products/detail/old-love/01 / 02 / 03.webp`                                  | E3     | Captions: "Saffron and mango, bright for a moment." / "Amber, sugar and ambergris pull it warm." / "Fir resin, ambroxan and cedar hold the base." |
| Homepage H03 card (100ml)      | new derivative of `productPics/Product/only product/Ami Daddy0474_100ml_oldLove.JPG` | E1     | Part One H03 already calls for this new export.                                                                                                   |
| Homepage landing feature       | `public/landing/old-love-main.webp`                                                  | E1/E7  | Source: `productPics/landingPagePics/oldLove_mainpage1.JPG`.                                                                                      |
| Note strip                     | `public/ingredients/old-love-notes.webp`                                             | E6     | Header "Scent notes".                                                                                                                             |
| Editorial (H09 primary)        | `public/gallery/old-love/05.webp`                                                    | E4     | Pair with Heavenly `11`.                                                                                                                          |
| Curated tile                   | `public/curated/products/old-love/detail.webp`                                       | E1     | Old Love has no `public/curated/old-love.webp`; this is its curated still.                                                                        |
| Gallery reserve                | `public/gallery/old-love/01–04, 06–14.webp`                                          | E4     | PDP "more" grid / campaign.                                                                                                                       |

**20ml photo map**

| Slot                  | File                                        | Recipe | Delta                                                                     |
| --------------------- | ------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| PDP hero (size=20ml)  | `public/products/20ml/studio/old-love.webp` | E5     | Source: `productPics/Product/20ml single/Ami Daddy0621_20ml_OldLove.JPG`. |
| Card (20ml row / H06) | `public/products/20ml/studio/old-love.webp` | E5     | "Add 20ml to bag".                                                        |
| Angle set             | `public/products/20ml/old-love/01–04.webp`  | E5     | 4-thumb strip.                                                            |
| Alt                   | `public/products/20ml/old-love.webp`        | E5     | Fallback.                                                                 |

## 9. Product detail page — the low-friction buy path

Current PDP (`src/components/ProductDetail.tsx`) is already close: a cinematic hero with size + price + Add to bag above the fold, a sticky buy rail beside a studio close-up, a `StickyBuyBar` that follows on scroll, an unfold section, note strip, wear steps, FAQ, close. Keep the structure. The redesign is grading, copy and four friction cuts.

### 9.1 Section order (unchanged, restyled)

1. **PDP hero** — full-bleed campaign frame (E1), back link, kicker, name, story line, size toggle, price + MRP, **Add to bag**. This must be usable at 390×844 with no scroll: name, one size control, price and the button all visible.
2. **The object** — studio close-up (E3) beside a sticky buy rail: notes line, name, description, size selector with "Discover it / Make it yours" sublabels, price row, **Add to bag**, assurances (₹99 / free over ₹599, secure Razorpay, authentic EdP), facts list (wears, intensity stars, best for, character).
3. **How it unfolds** — three macro beats (E3) with the note captions from section 8.
4. **Ingredients + wear** — note strip (E6) + three wear steps. Keep "Top, heart and base, shown for reference"; never call it raw ingredients.
5. **Before it becomes yours** — FAQ: longevity, when to wear, unisex, 20ml vs 100ml (same composition).
6. **Close** — "Four signatures. Yours is one click away." → `/shop`.
7. **StickyBuyBar** — appears once the hero button scrolls off; name, size, price, Add.

### 9.2 The four friction cuts

| #   | Now                                                                      | Change                                                                                                                                                          | Why                                                                             |
| --- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| F1  | Add to bag → toast "Added", user still on page, must find the bag icon   | On add, **open the bag drawer** (same action as the icon). One tap from PDP to a checkout button.                                                               | Removes the "where did it go" hunt. The drawer already has Proceed to Checkout. |
| F2  | No express path                                                          | Add a secondary **"Buy it now"** on the PDP hero and buy rail: adds the item and routes straight to `/checkout`, skipping the drawer.                           | Two taps, view → pay, for the decided buyer.                                    |
| F3  | Size defaults to 100ml always                                            | Honour `?size=` from the card link (already wired in `ProductCard` → `productHref`), and if the visitor arrived from the 20ml row, land on 20ml.                | The choice the user already made on the previous screen should carry.           |
| F4  | `ViewTransition` shared-element morph depends on names matching per size | Keep, but ensure the PDP hero image name matches the card's `product-${slug}-${size}` for the size actually shown, so the morph never falls back to a hard cut. | Continuity is the whole point of the cinematic direction.                       |

### 9.3 Combo PDPs

The same component renders the two combos (`collection === "combos"`). For them: hide the "20ml vs 100ml" FAQ row (already conditional on `!isCombo`), show pack contents as a four-item list (Billionaire, Cold War, Heavenly, Old Love), and use the combo photo maps in sections 11 and 12. No per-note pyramid claims for the set beyond "four compositions".

## 10. Shop / collection page — `/shop`

Current page: a single-bottle hero, a filter form, then three stacked size sections (100ml, 20ml, Combo pack of 4) of `ProductCard`s with `lockSize`. Keep the three-section spine. Four changes.

| #   | Change                                                                                                                                                                                                                                          | Detail                                                                                                                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | **Hero shows the range, not one bottle.** Replace `public/products/detail/old-love/hero.webp` with a four-bottle frame: `public/products/combos/100ml/02.webp` (E2), or the proposed `public/campaign/future-heirloom/house-hero-desktop.webp`. | A shop page that opens on one product reads as a single-product store.                                                                                                                            |
| S2  | **Unlock size on the cards.** Drop `lockSize` in the 100ml and 20ml sections so each card carries its own 20ml/100ml toggle + price + Add.                                                                                                      | Lets a visitor pick size and add from the grid without opening the PDP — the single biggest friction cut on this page. Keep the section heading ("20ml fragrances") as context, not a constraint. |
| S3  | **Sticky filter bar.** On scroll past the hero, collapse the filter `form` into a sticky one-row bar (search, family, sort).                                                                                                                    | The current form scrolls away; re-filtering means scrolling back up.                                                                                                                              |
| S4  | **Add-to-bag opens the drawer** (same as F1).                                                                                                                                                                                                   | Consistent with PDP.                                                                                                                                                                              |

**Filter copy:** Search "Name, note or mood" · Range: All products / Single fragrances / Combos · Scent family: All / Woody / Fresh / Floral / Amber / Mixed · Sort: Featured / Price low-high / Price high-low / Name.
**Empty state:** "No scent matches that combination." → "Reset the collection" → `/shop`.
**Section eyebrows:** 100ml "The full ritual" · 20ml "The discovery edit" · Combo "The complete discovery wardrobe".

**Card image per section:** 100ml → the fragrance's PDP-hero-grade E1 still (section 8). 20ml → `public/products/20ml/studio/<slug>.webp` (E5). Combo → `public/products/combos/20ml/latest-pack-of-4.webp` (E2).

## 11. Discovery Set — `/products/signature-combo-20ml`

**Commerce:** 4 × 20ml, 80ml total. Local snapshot ₹699 / MRP ₹996 — render live from catalog.
**Heading:** "Meet all four. Let your skin decide."
**Body:** "Billionaire, Cold War, Heavenly and Old Love. Four 20ml fragrances, ready to discover at your own pace. The same compositions as the 100ml bottles, in a size you can carry."
**Primary CTA:** "Add the discovery set". **Secondary:** "See what is included" (anchors to the four-item list on the same page).
**Contents list:** four rows, each linking to that fragrance's PDP — name, one-line from section 8, 20ml studio still.
**No window gift box** shown as included until fulfilment confirms it ships (Part One section 3, "Packaging decision").

| Slot        | File                                                                                                                        | Recipe | Delta                                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero        | `public/products/combos/20ml/latest-pack-of-4.webp`                                                                         | E2     | Confirmed source candidate: `productPics/new_photos_for catalouge_20ml/combo4_20ml.png` — use the larger original after a resolution check.     |
| Secondary   | `public/products/20ml/studio/pack-of-4.webp`                                                                                | E2     | Four travel bottles, studio.                                                                                                                    |
| Gallery     | `public/products/combos/20ml/01–09.webp`                                                                                    | E2/E7  | Angles + one in-hand frame; PDP thumb strip.                                                                                                    |
| Source pool | `productPics/Product/20ml Packof_4/*` (`Ami Daddy0501/0502/0605_20ml_Combo_of_4`, `Ami Daddy4063/4067/4079/4090/4091/4093`) | E2     | Pick the cleanest four-bottle layouts; the rest to archive.                                                                                     |
| HEIC pool   | `productPics/new_photos_for catalouge_20ml/IMG_*.heic/HEIC` (10 files)                                                      | —      | **Unassigned pending conversion and visual review.** Do not assume fragrance or packaging from the filename. Convert, contact-sheet, then slot. |

**Edit prompt (hero):** E2 core + "four current 20ml travel bottles only; keep the blue, pale gold, black and red true; no cartons, ribbons or gift box; 3:2 with comfortable negative space, plus a 4:5 mobile frame with all four visible and clear space above."

## 12. Full Collection — `/products/signature-combo-100ml`

**Commerce:** 4 × 100ml, 400ml total. Local snapshot ₹4,299 / MRP ₹5,996 — render live.
**Heading:** "Every side of you. In full size."
**Body:** "All four Amidaddy signatures in 100ml bottles. Powerful, fresh, soft, warm — the whole wardrobe, so the scent can fit the day instead of the other way round."
**Primary CTA:** "Add the full collection". **Secondary:** "View the collection set".
**Composition note:** this page must not look like the Discovery page. Wide full-bleed photograph, text below, not another split panel (Part One H08).

| Slot                                                            | File                                                                                                                                       | Recipe | Delta                                                                                                                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero                                                            | `public/products/combos/100ml/02.webp`                                                                                                     | E2     | Source: `productPics/Product/100ml packof4/Ami Daddy0539_100ml_Combo_of_4.JPG`.                                                                        |
| Packaging / secondary                                           | `public/products/combos/100ml/03.webp`                                                                                                     | E2     | Source: `productPics/Product/100ml packof4/Ami Daddy0577_100ml_Combo_of_4.JPG`. Show only cartons actually included.                                   |
| Gallery                                                         | `public/products/combos/100ml/01, 04.webp`                                                                                                 | E2     | PDP thumb strip.                                                                                                                                       |
| Homepage H02 house hero                                         | `productPics/Product/only product/Ami Daddy0497_100ml_Combo_of_4.JPG` → `public/campaign/future-heirloom/house-hero-{desktop,mobile}.webp` | E2     | Alternative existing asset: `public/products/combos/100ml/01.webp`.                                                                                    |
| Source pool                                                     | `productPics/Product/100ml packof4/*` and `productPics/Product/only product/Ami Daddy04{81,85,93,97,522,529}_100ml_Combo_of_4.JPG`         | E2     | Pick the stepped-podium and flat-plane layouts; rest to archive.                                                                                       |
| `productPics/Product/only product/Ami Daddy05{51,66,82,85}.JPG` | —                                                                                                                                          | E1/E3  | Likely single-bottle or detail "only product" stills — contact-sheet and assign to whichever fragrance/detail they show; do not guess from the number. |

**Edit prompt (hero):** E2 core + "preserve the four 100ml bottles and their real scale from the stepped-podium source; refinish only the surroundings into matte graphite plinths with softly lit edges; every cap visible; no invented bundle packaging; wide 16:9, no generated text."

## 13. Bag drawer and checkout — the friction budget

### 13.1 Bag drawer (`src/components/CartSidebar.tsx`) — keep, tighten

Already good: right-side drawer, focus trap, Escape to close, free-shipping progress meter ("Add ₹X more for free delivery" → "You unlocked free delivery"), a "You may also like" quick-add row of three 20ml singles, subtotal / shipping / total, "Proceed to Checkout", "Continue Shopping".

| Keep                                                         | Change                                                                                                                                                                                   |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Free-ship meter, quick-add row, qty steppers, popLayout exit | Threshold and fee come from `DEFAULT_FREE_SHIPPING_PAISE` / commerce config — never a hard-coded "₹599" string in the label (it currently hard-codes `₹599` next to the meter; bind it). |
| Drawer as the post-add destination (F1)                      | On the empty state, add one line + a link: "Nothing here yet." → "Browse the four signatures" → `/shop`.                                                                                 |
| "Proceed to Checkout"                                        | Make it the visually dominant action; "Continue Shopping" stays a quiet ghost link.                                                                                                      |

### 13.2 Checkout (`/checkout` → `CheckoutClient`)

Target: **drawer → checkout → paid in one screen, no account required.**

| Rule                           | Detail                                                                                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guest by default               | No login wall. Offer "save this for next time" as an opt-in checkbox after payment, not a gate before it.                                                                                   |
| One page, one column on mobile | Contact (email + phone), shipping address, then Razorpay. Order summary sticky on desktop, collapsible on mobile with the total always visible.                                             |
| Minimal fields                 | Name, phone, email, address lines, city, state, PIN. Auto-fill city/state from PIN where possible. No company, no "address type", no optional-field clutter.                                |
| Prefill                        | Reuse the last order's address for a returning session.                                                                                                                                     |
| Errors                         | Inline, on blur, focus jumps to the first invalid field. No decorative motion, no page pin, no smooth-scroll hijack on this route (Part One motion score).                                  |
| Trust line                     | One row under the pay button: "₹99 delivery, free over ₹599 · Secure Razorpay · GST included". No invented badges.                                                                          |
| Coupon                         | Collapsed "Have a code?" toggle — never an open field competing with the pay button. Coupon must never remove already-earned free shipping (fixed in commit f612fa7 — keep that behaviour). |
| Success                        | `/checkout/success` clears the cart (`ClearCartOnSuccess`), shows order number, what was bought, delivery expectation, and "Track this order" → `/account/orders/[id]`.                     |

### 13.3 Friction budget (acceptance criteria)

- **Shop grid → paid:** ≤ 5 taps (pick size on card → Add → Proceed → fill address → pay).
- **PDP → paid:** ≤ 4 taps with "Buy it now" (Buy it now → fill address → pay), ≤ 5 via the drawer.
- Add-to-bag reachable with **no scroll** on PDP hero at 390×844 and on every shop card.
- No route change between Add and a visible checkout button.
- Checkout is one screen; the pay button is reachable within one scroll on mobile with a saved address.

## 14. Supporting pages

### 14.1 Our Approach — `/our-approach` (new)

Linked from homepage H04 and the footer. This is where the formulation story lives, written to the evidence rules in Part One section 2 — no percentages, no pioneer claim, no purity ranking until verified.

- **H1:** "Everything begins inside the bottle."
- **Lead:** "We started Amidaddy to make fragrance on our own terms: original compositions, carefully chosen ingredients, and a scent that earns its place in your day."
- **Three blocks** (each: short heading + 2 sentences + one E3 macro image):
  1. "Original, not a reference." — "Every Amidaddy scent is its own composition. We are not trying to reproduce another house's smell."
  2. "The composition comes first." — "Our attention goes to what is in the bottle and how it develops on skin, from the first spray to the trail."
  3. "Made to be worn, not saved." — "Fragrance you finish, in a size that fits your routine — 20ml to discover, 100ml for every day."
- **Founder line:** "We came here to create our own."
- **No** invented lab, perfumer portrait, supplier, certificate or extractor imagery.
- **Images:** `productPics/Product/Billionaire/Ami Daddy3416.JPG`, `productPics/Product/Heavenly/Ami Daddy0050.JPG`, `productPics/Product/Cold War/Ami Daddy0151.JPG` → E3 exports. Reserve pool: any `productPics/<Fragrance>/*.JPG` macro frames.
- **CTA:** "Find your signature" → `/shop`.

### 14.2 Scent School — `/scent-school` (exists, restyle only)

Eight chapters, already real routes (`/scent-school/[chapter]`), hub at `/scent-school`. Keep the course structure and copy. Changes: regrade the hero from `public/curated/hero-models-3.webp` to the Future Heirloom palette (E4); apply the Part One type scale and tokens; keep "free, and no sign-up". Chapter hero images: `public/curated/hero-models{,-2,-4}.webp` (E4). Cross-link from PDP FAQ ("Learn about fragrance") and H11.

### 14.3 About — fold into `/our-approach` or a short `/about`

If separate: the founder manifesto from Part One section 2, one editorial image (`public/gallery/heavenly/11.webp`, E4), links to `/our-approach` and `/shop`. No timeline, no team grid, no press logos unless real.

### 14.4 Account & orders — `/account`, `/account/orders`, `/account/orders/[id]`

Exists. No redesign of flows, only tokens and type. `/account/orders/[id]` is the "Track an order" destination from the footer and success page: status timeline (`OrderTimeline`), items, address, support link (`/account/orders/[id]/support`), receipt (`/account/orders/[id]/receipt`). Keep `OrderCancelForm` where eligible.

### 14.5 Policies — `/policies/[slug]` (exists)

Five policies, keep all. Apply tokens/type. Footer links to every one. Do not paraphrase policy terms into marketing guarantees anywhere else on the site (Part One section 2, returns row).

### 14.6 Search

Search is a filter on `/shop?search=`, not a page. Keep it low-priority in the header (Part One H01). Input sanitisation already handled in `listCatalogProducts` (commit 4befbfb) — keep. No separate search results template.

### 14.7 404 / not-found

One frame (`public/gallery/coldwar/06.webp`, E4), "This page has moved on.", "Back to the collection" → `/shop`. No elaborate illustration.

## 15. Global chrome

| Element          | Spec                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Announcement bar | 28–32px, above the 72/64px header. "Complimentary delivery on orders of ₹599 or more." — threshold from commerce config. `AnnouncementBar` exists.                                                                                                                                                                                              |
| Header           | Left: one mark, `public/brand/amidaddy-ad-signature-mark.png` (verify contrast on `#101413`; commission a faithful light export if it muddies). Centre: Fragrances (`/shop`), Discovery sets (`/#discovery-set`), Our approach (`/our-approach`), Scent School (`/scent-school`). Right: Search, Account, Bag count. Mobile: Menu / mark / Bag. |
| Header on scroll | 18px blur, `--chrome-bg`. Collapses while the cart overlay is open (already handled via `document.body.dataset.overlay`).                                                                                                                                                                                                                       |
| Footer           | Columns: Shop / 20ml / 100ml / Discovery set / Full collection · Our approach / Scent School · Account / Track order / Contact · all five policies. Line: "Original compositions. Personal signatures." No newsletter field unless the full subscribe/confirm/unsubscribe flow exists.                                                          |
| Icons            | Lucide only (installed). Bag, close, arrows, checks, search, minus/plus, trash. No second icon set.                                                                                                                                                                                                                                             |
| Cursor           | No custom cursor. `PerfumeSprayCursor` exists in the tree — do not mount it (Part One motion rules: no cursor replacement).                                                                                                                                                                                                                     |

## 16. Motion and library decisions — consolidated answer

Which libraries, and how to get the animation right — matching Part One section 5:

| Need                                                                                      | Use                                                                                                                                                                                                                                   | Do not                                                                                       |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Layout, responsive, tokens                                                                | **Tailwind CSS v4** (installed) with `@theme` for the semantic tokens in Part One section 4                                                                                                                                           | Add a component/CSS framework on top                                                         |
| Hover, focus, simple fades, text layout                                                   | **Native CSS**                                                                                                                                                                                                                        | Reach for JS for anything CSS does                                                           |
| Cart drawer, quantity feedback, scent-finder transitions, card reveal, isolated UI leaves | **framer-motion 12.x** (installed) — respect `useReducedMotion` everywhere (already done in `ProductCard`, `CartSidebar`)                                                                                                             | Install `motion` alongside `framer-motion`                                                   |
| The **one** homepage cinematic pinned chapter (H05, "the fragrance unfolds")              | **GSAP + `@gsap/react`** with ScrollTrigger — add only at implementation time: `npm i gsap @gsap/react`. `useGSAP` scope, `gsap.matchMedia()` for the ≥1024px pin, explicit `end`, `ScrollTrigger.refresh()` after fonts/images ready | Let GSAP and framer-motion write to the same nodes; pin the whole page; scroll-jack          |
| Desktop wheel smoothing                                                                   | **Lenis** — optional, only if a measured prototype shows native scroll feels rough. One frame-loop owner, sync ScrollTrigger, disable on checkout and dialogs                                                                         | Combine Lenis with CSS `scroll-behavior: smooth`; add it "to feel premium" without measuring |
| Images                                                                                    | `next/image` + the existing `Photo` wrapper (AVIF/WebP, blur placeholder); Sharp for derivatives                                                                                                                                      | Ship camera originals to the browser                                                         |
| QA                                                                                        | Playwright + axe + Lighthouse at implementation                                                                                                                                                                                       | —                                                                                            |

**Getting the animation to feel right** is mostly restraint, not a library: real poster visible on first paint (no loader gate), one 1.2s scale-settle on the hero bottle, 160–350ms on hover/selection, one optional scroll pin capped at 1.5 viewport heights with `scrub: 0.6`, everything reduced-motion aware. Build to the motion score table in Part One section 5.

## 17. Full image inventory

Every file under `public/` and `productPics/`. "Ship" = enhanced derivative goes live in the slot named. "Reserve" = kept for PDP "more" grids or later campaigns, not on first paint. "Archive" = move to `assets-source/archive/`, do not publish. "Review" = decode/contact-sheet before assigning.

### 17.1 `public/` — 124 WebP assets

| Path / group                                                                                            | Count | Role                                                         | Action                                                                                   |
| ------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `brand/amidaddy-ad-signature-mark.png`                                                                  | 1     | Header + footer mark                                         | Ship; verify on `#101413`, light export if needed                                        |
| `brand/amidaddy-ad-mark.png`, `amidaddy-mark.png`, `amidaddy-icon-64.png`, `amidaddy-favicon-black.png` | 4     | Favicon / alt marks                                          | Keep one favicon; retire duplicate wordmarks (Part One H01: "one clear logo, not three") |
| `og.png`                                                                                                | 1     | Social card                                                  | Regrade to Future Heirloom                                                               |
| `curated/billionaire.webp`, `cold-war.webp`, `heavenly.webp`                                            | 3     | Curated stills                                               | Ship as shop/PDP fallback stills (E1)                                                    |
| `curated/product-detail-1.webp`, `product-detail-2.webp`                                                | 2     | Generic detail                                               | Reserve (E3)                                                                             |
| `curated/hero-models.webp`, `-2`, `-3`, `-4`                                                            | 4     | Campaign models                                              | Ship: `-3` Scent School hero, others chapter/editorial (E4)                              |
| `curated/products/{billionaire,coldwar,heavenly,old-love}/detail.webp`                                  | 4     | Per-fragrance curated still                                  | Ship; Old Love's is its curated tile (section 8.4) (E1)                                  |
| `gallery/billionaire/01–11.webp`                                                                        | 11    | Campaign + editorial                                         | `04` → H09 editorial (E4); rest reserve for PDP grid                                     |
| `gallery/coldwar/01–10.webp`                                                                            | 10    | Campaign + editorial                                         | `02` → H09 editorial (E4); `06` → 404; rest reserve                                      |
| `gallery/heavenly/01–13.webp`                                                                           | 13    | Campaign + editorial                                         | `11` → H09 / About (E4); rest reserve                                                    |
| `gallery/old-love/01–14.webp`                                                                           | 14    | Campaign + editorial                                         | `05` → H09 (E4); rest reserve                                                            |
| `hero/heavenly-wide.webp`, `heavenly-mobile.webp`                                                       | 2     | Pre-sized homepage hero                                      | Ship, regrade only (E1)                                                                  |
| `ingredients/{billionaire,coldwar,heavenly,old-love}-notes.webp`                                        | 4     | Horizontal note strips                                       | Ship on each PDP, header "Scent notes" (E6)                                              |
| `landing/heavenly-main.webp`, `old-love-main.webp`                                                      | 2     | Homepage feature stills                                      | Ship (E1/E7)                                                                             |
| `products/20ml/studio/{billionaire,cold-war,heavenly,old-love}.webp`                                    | 4     | **20ml purchase truth** — PDP hero + card for the small size | Ship (E5). This is the "section 8" list Part One pointed to.                             |
| `products/20ml/studio/pack-of-4.webp`                                                                   | 1     | Discovery set secondary                                      | Ship (E2)                                                                                |
| `products/20ml/{billionaire,cold-war,heavenly,old-love}/01–04.webp`                                     | 16    | 20ml angle strips                                            | Ship as PDP thumb strips (E5)                                                            |
| `products/20ml/{billionaire,cold-war,heavenly,old-love}.webp`                                           | 4     | 20ml top-level stills                                        | Reserve / fallback (E5)                                                                  |
| `products/combos/20ml/01–09.webp`                                                                       | 9     | Discovery set gallery                                        | Ship as PDP thumbs (E2/E7)                                                               |
| `products/combos/20ml/latest-pack-of-4.webp`                                                            | 1     | **Discovery set hero** + H07                                 | Ship (E2)                                                                                |
| `products/combos/100ml/01–04.webp`                                                                      | 4     | Full collection gallery                                      | `02` hero, `03` packaging, `01`/`04` thumbs; `01` alt for H02 (E2)                       |
| `products/detail/{billionaire,coldwar,heavenly,old-love}/hero.webp`                                     | 4     | **100ml PDP hero**                                           | Ship (E1); Heavenly — crop to 100ml if it shows old packaging                            |
| `products/detail/{billionaire,coldwar,heavenly,old-love}/01–03.webp`                                    | 12    | PDP object + the three unfold beats                          | Ship (E3), captions in section 8                                                         |

### 17.2 `productPics/` — camera originals (editing sources)

| Path / group                                                                                                          | Count | Maps to                                             | Action                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `billionaire/Ami Daddy3976–4055.JPG`                                                                                  | 11    | Billionaire campaign/macro                          | Source pool for E1/E3/E4 Billionaire slots; unused → reserve                                                                                     |
| `Cold War/Ami Daddy3461–3577.JPG`                                                                                     | 10    | Cold War campaign/macro                             | Source pool, Cold War                                                                                                                            |
| `Heavenly/Ami Daddy3618–3763.JPG` (incl. `.jpg`)                                                                      | 12    | Heavenly campaign/macro                             | Source pool, Heavenly                                                                                                                            |
| `Old Love/Ami Daddy3791–4096.JPG` (incl. `.jpg`)                                                                      | 13    | Old Love campaign/macro                             | Source pool, Old Love; ignore styling roses for notes                                                                                            |
| `landingPagePics/Heavenly_MainPage2.JPG`                                                                              | 1     | `public/landing/heavenly-main.webp`                 | Source for that slot (E1/E7)                                                                                                                     |
| `landingPagePics/oldLove_mainpage1.JPG`                                                                               | 1     | `public/landing/old-love-main.webp`                 | Source for that slot (E1/E7)                                                                                                                     |
| `Product/Billionaire/Ami Daddy3348–3429.JPG`                                                                          | 7     | Billionaire 100ml PDP hero/object                   | `3348` → PDP hero source; `3416` → H04 belief image (E1/E3)                                                                                      |
| `Product/Cold War/Ami Daddy0122–0316.JPG` (incl. `.jpg`)                                                              | 9     | Cold War 100ml PDP                                  | `0122` → PDP hero source (E1/E3)                                                                                                                 |
| `Product/Heavenly/Ami Daddy0027–0252.JPG`                                                                             | 9     | Heavenly 100ml PDP                                  | `0027` → PDP hero source (E1/E3)                                                                                                                 |
| `Product/Old Love/Ami Daddy0258–0472.JPG`                                                                             | 10    | Old Love 100ml PDP                                  | pair with `only product/Ami Daddy0474_100ml_oldLove.JPG` for hero + H03 card (E1/E3)                                                             |
| `Product/only product/Ami Daddy0474_100ml_oldLove.JPG`                                                                | 1     | Old Love 100ml hero + H03 card                      | Primary source, Old Love 100ml (E1)                                                                                                              |
| `Product/only product/Ami Daddy04{81,85,93,97,522,529}_100ml_Combo_of_4.JPG`                                          | 6     | H02 house hero + `/products/signature-combo-100ml`  | `0497` → H02 source; rest → full-collection gallery pool (E2)                                                                                    |
| `Product/only product/Ami Daddy05{51,66,82,85}.JPG`                                                                   | 4     | Unlabelled "only product" stills                    | **Review** — contact-sheet, then assign to the fragrance/detail shown (E1/E3)                                                                    |
| `Product/100ml packof4/Ami Daddy0528/0539/0577/0598_100ml_Combo_of_4` (incl. `.jpg`)                                  | 4     | `/products/signature-combo-100ml` + H08             | `0539` → hero, `0577` → packaging, `0528`/`0598` → gallery (E2)                                                                                  |
| `Product/20ml Packof_4/Ami Daddy0501/0502/0605_20ml_Combo_of_4` + `Ami Daddy4063/4067/4079/4090/4091/4093.JPG`        | 9     | Discovery set + H07                                 | Source pool for `combos/20ml/*` and `studio/pack-of-4` (E2); weak layouts → archive                                                              |
| `Product/20ml single/Ami Daddy0609_20ml_Heavenly / 0612_20ml_Coldwar / 0617_20ml_Billionaire / 0621_20ml_OldLove.JPG` | 4     | `public/products/20ml/studio/<slug>.webp`           | Primary sources for the four 20ml PDP heroes (E5)                                                                                                |
| `Product/Models with pack of four 20ml/`                                                                              | 0     | —                                                   | Empty folder; ignore                                                                                                                             |
| `new_photos_for catalouge_20ml/combo4_20ml.png`                                                                       | 1     | `public/products/combos/20ml/latest-pack-of-4.webp` | Confirmed source for the discovery hero (E2)                                                                                                     |
| `new_photos_for catalouge_20ml/IMG_8981.heic … IMG_9256.heic/HEIC`                                                    | 10    | 20ml set candidates                                 | **Review** — HEIC could not be decoded for Part One. Convert, contact-sheet, then assign. Do not infer fragrance or packaging from the filename. |

### 17.3 Elsewhere

| Path                                                           | Action                                                                                                                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets-source/`                                               | Camera originals / working files. Never served to the browser. Add `assets-source/archive/` for E8 material (old cylindrical 20ml bottles, windowed gift box). |
| `Edited Photos-20260806T141130Z-1-001.zip` (612 MB, repo root) | Not an asset. Extract outside `public/`, or delete once its contents are in `assets-source/`. Do not commit or deploy it.                                      |
| `docs/redesign/contact-sheets/*.jpg`                           | Reference sheets for this plan; index numbers match `photo-inventory.json` / `source-inventory.json`. Not shipped.                                             |

### 17.4 Standing rules

- Including every file in this inventory does not mean loading every file for every visitor. First paint carries the hero, the four shop-card stills and the announcement — nothing from the reserve pools.
- Ten HEIC files and the four unlabelled `only product` stills stay **Review** until decoded and contact-sheeted. Do not guess.
- Do not invent a two-bottle SKU from a photo that contains two bottles. Do not show a group photo as a single item's primary image. Do not infer bottle capacity from apparent scale.
- Keep a source → output manifest (`docs/redesign/manifest.json` suggested) so every shipped WebP traces back to its camera original and its edit recipe.

## 18. Build sequence

Ship in this order so shopping keeps working the whole time.

1. **Tokens + type.** Add the Future Heirloom tokens (Part One section 4) to `src/styles/tokens.css` / `@theme`; self-host Space Grotesk + Manrope via `next/font`. No layout change yet.
2. **Global chrome.** Header, announcement, footer to section 15. One mark.
3. **Shop page.** S1–S4. This is where most buyers land from ads — do it early.
4. **PDP.** F1–F4, copy from section 8, regrade in place.
5. **Bag drawer + checkout.** Section 13. Bind the shipping threshold, add "Buy it now", tighten checkout fields.
6. **Homepage.** H01–H14 from Part One, GSAP added only for H05.
7. **Supporting pages.** `/our-approach` (new), then restyle Scent School, policies, account, 404.
8. **Photography.** Run the E1–E7 recipes against the source pools in section 17; convert and review the 10 HEIC + 4 unlabelled stills; write `docs/redesign/manifest.json`.
9. **QA.** Playwright flow (shop → paid ≤ 5 taps), axe, Lighthouse, reduced-motion pass, 390×844 no-scroll-to-buy check.
