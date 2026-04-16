# Amidaddy Perfumes - E-Commerce Features

This document outlines the features and functionalities built into the *Amidaddy Permfumes* store.

## 1. Premium Fluid User Interface
The entire layout has been transformed using a robust CSS design system (`style.css`), relying thoroughly on Vanilla CSS to ensure maximum performance and precise creative control without bulky frameworks.

*   **Glassmorphism Effects:** The navigation bar now utilizes a blurred backdrop effect (`backdrop-filter`) making it blend beautifully as the user scrolls over imagery.
*   **Micro-Animations:** Elements thoughtfully respond to interactions. You'll notice subtle translations (`translateY(-10px)`) and deeper shadows on product cards during hover.
*   **Scroll Animations:** The page contents use keyframe CSS classes (`animate-slide-up`, `animate-fade-in`) paired with animation delays to orchestrate a cascading entrance effect for headers, galleries, and products as soon as the page loads. 
*   **Rich Typography & Palette:** Adopts `Cinzel` for sharp, classic headings matched with `Inter` for clean body text. The rich earthy tones, golds, and creams project a luxury perfume brand aesthetic.

## 2. E-Commerce Engine & Data Structure
*   **Separation of Products and Combos:** The `script.js` holds mock backend arrays for standard products (`PERFUMES`) and bundled offers (`COMBOS`).
*   **Dynamic Client Rendering:** Product grids, hero banners, sizes, and cart layouts are strictly rendered dynamically via JS map functions. This minimizes redundant HTML overhead and builds the skeleton seamlessly.

## 3. Buy One Get One (BOGO) Offer Logic
A primary feature requested is handling BOGO logic reliably.

*   **Implementation (`calculateCartTotals` in `script.js`):** 
    When accessing the Cart page, the script unnests merged items by quantity (e.g., if you bought 3 of one item, it expands to 3 discrete list rows in memory). It sorts the entire basket by `unitPrice` descending.
    It loops through every item and flags every odd index (the 2nd, 4th, 6th most expensive item, etc.) as `isFree`.
*   **Customer Value First:** Sorting by descending price guarantees that if the customer mixes products in a checkout pairing, they get the fairest markdown (the cheaper of any pair is free).
*   **Cart Display:** 
    Free items display a "(FREE BOGO)" badge. The original price receives a clear `.strikethrough` class and the word *FREE* is emphasized.
    The order summary accurately lists Subtotal, Total BOGO Discount, and final Amount to Pay.

## 4. Curated Combos
*   Dedicated `Combo` rendering blocks exist within the website logic. A combo has a predefined fixed price overriden in `PRICE_BY_SIZE`, bypassing standard 50ml/100ml selection sizes to instead enforce the "Combo Pack" single selection.
*   We've introduced uniquely styled badges indicating best value natively linking multiple perfumes to a single price point offering.

## 5. Persistent Local Storage Cart
*   User selections endure refreshes via `getCart()` and `setCart()`. Adding an item matches internal Product ID AND stringified size variables to properly index an existing payload or push a new index.
*   **Toast Notifications:** Adding items gently slides a non-intrusive UI toast out in the bottom right corner, confirming actions without interrupting the shopping flow.
