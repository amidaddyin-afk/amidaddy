import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isPolicySlug,
  policyDetails as d,
  policyLinks,
  type PolicySlug,
} from "@/lib/policies";

type Section = { heading: string; paragraphs?: string[]; bullets?: string[] };
type Policy = { title: string; intro: string; sections: Section[] };
const contact = `Contact ${d.supportEmail}`;

const policies: Record<PolicySlug, Policy> = {
  "shipping-delivery": {
    title: "Shipping & Delivery Policy",
    intro: "How we process, dispatch and deliver Amidaddy orders across India.",
    sections: [
      {
        heading: "Order processing",
        bullets: [
          "Orders are processed within 1–2 business days after payment confirmation, Monday–Saturday excluding public holidays.",
          "An order confirmation is sent after checkout. A separate dispatch notification with courier and tracking details confirms that the parcel has left our facility.",
        ],
      },
      {
        heading: "Delivery timelines",
        bullets: [
          "We currently ship within India only.",
          "Estimated delivery is 3–7 business days from dispatch. Metro deliveries typically take 3–5 business days; remote pin codes may take 7–9 business days.",
          "Timelines are estimates. Weather, strikes, courier disruption and other events outside our control can cause delays, but we will assist with tracking and follow-up.",
        ],
      },
      {
        heading: "Shipping charges",
        paragraphs: [
          `Shipping costs ${d.shippingFee}. Shipping is complimentary when the merchandise subtotal reaches ${d.freeShippingAbove}. The final charge is shown before payment.`,
        ],
      },
      {
        heading: "Payment before dispatch",
        paragraphs: [
          "All orders are prepaid. Cash on Delivery is not currently available, and an order ships only after payment is confirmed.",
        ],
      },
      {
        heading: "Tracking and delivery attempts",
        bullets: [
          "Signed-in customers can track an order from the Orders page. Courier details and the tracking link are also sent after dispatch.",
          "Courier delivery attempts vary by destination and courier. Keep your address and phone number accurate and reachable. If a parcel is returned after unsuccessful attempts, we will contact you about re-shipping charges or an eligible refund.",
        ],
      },
      {
        heading: "Address changes",
        paragraphs: [
          `Address changes are possible only before dispatch. ${contact} as soon as possible with your Order ID; a dispatched parcel cannot be redirected.`,
        ],
      },
      {
        heading: "Damaged or tampered parcels",
        paragraphs: [
          `Inspect the outer packaging on delivery. If it appears damaged, tampered with or broken, record the condition and report it within 24–48 hours to ${d.supportEmail}. An uninterrupted unboxing video is strongly recommended because it helps us assess the claim.`,
        ],
      },
    ],
  },
  "returns-refunds-replacements": {
    title: "Return, Refund & Replacement Policy",
    intro:
      "Fragrances are sealed personal-care products, so eligibility is limited to verified fulfilment, transit and manufacturing issues.",
    sections: [
      {
        heading: "Eligible within 7 days of delivery",
        bullets: [
          "A damaged, leaking or broken bottle.",
          "A wrong fragrance, wrong size or missing item.",
          "A manufacturing defect, such as a spray pump that fails on first use.",
        ],
      },
      {
        heading: "What is not covered",
        bullets: [
          "Change of mind, dislike of a scent, or an ordering mistake.",
          "A product with a broken outer seal or shrink wrap, unless the claim concerns a manufacturing defect or transit damage.",
          "Clearance or final-sale products marked as such at checkout.",
          "Damage caused by misuse, mishandling or normal wear after delivery.",
        ],
      },
      {
        heading: "How to request a replacement",
        bullets: [
          `Email ${d.supportEmail} within 7 days of delivery with your Order ID.`,
          "Include clear photos or video of the product, label and outer packaging. A continuous unboxing video is strongly recommended and can speed up review.",
          "We aim to respond within 2 business days.",
          "If approved, we will arrange reverse pickup where serviceable, or provide return instructions. After inspection, an eligible replacement is sent at no extra cost.",
          "If replacement stock is unavailable, an eligible refund will be issued instead.",
        ],
      },
      {
        heading: "Refunds",
        bullets: [
          "Approved refunds go only to the original prepaid payment method. We do not issue cash refunds or transfer refunds to another account except where individually approved.",
          "We initiate an approved refund within 5–7 business days. Banks and payment providers may need a further 5–10 business days to reflect it.",
        ],
      },
      {
        heading: "Cancellations",
        bullets: [
          "Orders may be cancelled free of charge before dispatch. Self-service cancellation is available while an order is payment-pending or confirmed; after that, contact support immediately.",
          "A shipped order cannot be cancelled. You may refuse delivery, but any shipping charge is non-refundable and the return is assessed after it reaches us.",
        ],
      },
      {
        heading: "Gift sets and combos",
        paragraphs: [
          "A set is eligible only when its outer packaging or at least one item is damaged, missing or incorrect. Photograph the complete set on receipt before opening if a claim may be needed.",
        ],
      },
    ],
  },
  "payment-terms": {
    title: "Payment Terms",
    intro: `All orders are prepaid and processed securely through ${d.paymentGateway}.`,
    sections: [
      {
        heading: "Accepted methods",
        bullets: [
          "UPI methods supported by Razorpay.",
          "Supported credit and debit cards.",
          "Net banking and any wallets shown by Razorpay at checkout.",
          "Cash on Delivery is not available.",
        ],
      },
      {
        heading: "Payment security",
        paragraphs: [
          `Transactions are processed by ${d.paymentGateway}. We do not store full card, UPI or banking credentials on our servers. Payment information is encrypted in transit.`,
        ],
      },
      {
        heading: "Currency and pricing",
        bullets: [
          "Prices are in Indian Rupees and include applicable GST unless stated otherwise.",
          "Prices may change without notice. The amount displayed and verified when checkout is completed is the amount charged.",
        ],
      },
      {
        heading: "Confirmation and invoices",
        bullets: [
          "An order is confirmed only after payment is successfully received and verified.",
          "A GST-inclusive receipt is available from the order page. Order confirmation and updates are sent to the email address supplied at checkout.",
        ],
      },
      {
        heading: "Failed, pending or unmatched payments",
        paragraphs: [
          `Do not place a duplicate order if money is debited but the order is not confirmed. Failed or pending debits are typically reversed by the bank or payment provider within 5–7 business days. If not, email ${d.supportEmail} with the Order ID and transaction reference so we can investigate.`,
        ],
      },
    ],
  },
  "terms-conditions": {
    title: "Terms & Conditions",
    intro: `By accessing this website, creating an account or placing an order with ${d.brand}, you agree to these terms.`,
    sections: [
      {
        heading: "Eligibility and accurate information",
        paragraphs: [
          "You must be at least 18, or use the site under a parent or legal guardian’s supervision, to order. You must provide accurate and complete contact, delivery and payment information.",
        ],
      },
      {
        heading: "Products",
        bullets: [
          "We sell Amidaddy fragrance products, including Old Love, Billionaire, Coldwar and Heavenly, in available formats and sets.",
          "Images are representative. Packaging or liquid shade may vary slightly because of screens, lighting or batches without affecting authenticity or quality.",
          "Country of origin: India. Products, formulations, packaging and prices may be updated or discontinued.",
        ],
      },
      {
        heading: "Pricing, orders and acceptance",
        bullets: [
          "Prices are in INR and include applicable taxes unless stated otherwise.",
          "An order is an offer to purchase and becomes binding when confirmed by us.",
          "We may refuse or cancel an order for suspected fraud, pricing error, unavailable stock or a terms violation. Any captured payment will be refunded in full where required.",
        ],
      },
      {
        heading: "Intellectual property and authenticity",
        bullets: [
          "The brand, product names, photography, packaging, video and website content may not be reproduced or used commercially without prior written permission.",
          "Products sold here are supplied directly by us. We are not responsible for goods bought from unauthorized third-party sellers.",
        ],
      },
      {
        heading: "Shipping, returns and payments",
        paragraphs: [
          "Our Shipping & Delivery Policy, Return, Refund & Replacement Policy and Payment Terms form part of these Terms.",
        ],
      },
      {
        heading: "Acceptable use",
        bullets: [
          "Do not use the website unlawfully, attempt unauthorized access, disrupt its operation, or transmit harmful, abusive or infringing content.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "To the extent permitted by law, we are not responsible for indirect or consequential loss arising from the site or products. Patch-test fragrance if you have sensitive skin. Our aggregate liability relating to an order is limited to the amount paid for it, without limiting rights that cannot legally be excluded.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: [
          "These Terms are governed by the laws of India. Applicable courts will have jurisdiction in accordance with Indian law and mandatory consumer protections.",
        ],
      },
      {
        heading: "Complaints and contact",
        paragraphs: [
          `Email ${d.supportEmail}. We aim to acknowledge complaints within 48 hours and resolve them within 30 days. Required registered-business and designated Grievance Officer details are pending business confirmation and must be added before production publication.`,
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "We may update these Terms. The date on this page shows the latest revision; continued use after publication is acceptance of the revised terms.",
        ],
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    intro: `${d.brand} respects your privacy. This policy explains the information we handle, why we use it and the choices available to you.`,
    sections: [
      {
        heading: "Information we collect",
        bullets: [
          "Contact and delivery information, including name, address, phone and email.",
          "Order history, amounts and payment transaction identifiers. Full card, UPI and banking credentials are processed by Razorpay and are not stored by us.",
          "Account information, authentication records and saved preferences.",
          "Essential cookie and session information, plus technical information needed for security and site operation.",
          "Messages sent to support.",
        ],
      },
      {
        heading: "How we use information",
        bullets: [
          "Process and deliver orders and provide status updates.",
          "Provide support and administer cancellations, replacements and refunds.",
          "Protect accounts, prevent fraud and secure checkout.",
          "Improve the website and customer experience.",
          "Meet tax, accounting and legal obligations.",
          "Send marketing only where you have opted in; you can opt out at any time.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We use cookies required for cart, authentication, security and preferences. If optional analytics are introduced, this policy and any consent controls will be updated before those cookies are used. Blocking essential cookies may prevent parts of the site from working.",
        ],
      },
      {
        heading: "Who receives information",
        bullets: [
          "Courier and logistics providers for delivery.",
          "Razorpay and relevant banks or payment networks for payment processing.",
          "Hosting, database, authentication and email providers that operate the store under appropriate obligations.",
          "Government, regulators or law-enforcement bodies where legally required.",
          "We do not sell personal information.",
        ],
      },
      {
        heading: "Security and retention",
        paragraphs: [
          "We use access controls, encryption in transit and other reasonable safeguards. No internet system is completely secure. We keep information only as long as needed for orders, support, security and legal or tax obligations, then delete or anonymize it where appropriate.",
        ],
      },
      {
        heading: "Your choices and rights",
        paragraphs: [
          `You may request access to or correction of your personal information, ask to delete your account or data subject to legal retention duties, and opt out of marketing. Email ${d.supportEmail} to make a request. We may verify your identity before acting.`,
        ],
      },
      {
        heading: "Children",
        paragraphs: [
          "The store is not directed to children under 18, and we do not knowingly collect their information without appropriate guardian involvement.",
        ],
      },
      {
        heading: "Changes and contact",
        paragraphs: [
          `We may update this policy and will revise the date shown here. For privacy questions or requests, email ${d.supportEmail}. Registered-business address details are pending business confirmation and must be added before production publication.`,
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return policyLinks.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return isPolicySlug(slug)
    ? { title: policies[slug].title, description: policies[slug].intro }
    : {};
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isPolicySlug(slug)) notFound();
  const policy = policies[slug];
  return (
    <main data-surface="commerce" className="policy-shell">
      <article className="policy-document">
        <p className="eyebrow">Client care · Legal</p>
        <h1 className="display-title">{policy.title}</h1>
        <p className="policy-updated">Last updated: {d.lastUpdated}</p>
        <p className="policy-intro">{policy.intro}</p>
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <aside className="policy-contact">
          <strong>Questions?</strong>
          <span>
            Email <a href={`mailto:${d.supportEmail}`}>{d.supportEmail}</a>.
          </span>
        </aside>
        <nav className="policy-nav" aria-label="Store policies">
          {policyLinks
            .filter((item) => item.slug !== slug)
            .map((item) => (
              <Link key={item.slug} href={`/policies/${item.slug}`}>
                {item.label}
              </Link>
            ))}
        </nav>
      </article>
    </main>
  );
}
