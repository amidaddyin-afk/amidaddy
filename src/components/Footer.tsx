import Link from "next/link";
import FooterAccountLinks from "@/components/FooterAccountLinks";
import { policyLinks } from "@/lib/policies";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="mx-auto max-w-[1500px]">
        <div className="footer-top">
          <div>
            <Link href="/" className="footer-mark">
              AMIDADDY
            </Link>
            <p>Original compositions. Personal signatures.</p>
          </div>
          <div>
            <h3>Fragrances</h3>
            <Link href="/shop">Shop</Link>
            <Link href="/shop#20ml">20ml</Link>
            <Link href="/shop#100ml">100ml</Link>
            <Link href="/products/signature-combo-20ml">Discovery set</Link>
            <Link href="/products/signature-combo-100ml">Full collection</Link>
          </div>
          <div>
            <h3>Amidaddy</h3>
            <Link href="/our-approach">Our approach</Link>
            <Link href="/scent-school">Scent School</Link>
          </div>
          <div>
            <h3>Client care</h3>
            <a href="mailto:support@amidaddy.in">support@amidaddy.in</a>
            <Link href="/account/orders">Track an order</Link>
            {policyLinks.map((policy) => (
              <Link key={policy.slug} href={`/policies/${policy.slug}`}>
                {policy.label}
              </Link>
            ))}
          </div>
          <div>
            <h3>Your account</h3>
            <FooterAccountLinks />
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Amidaddy Perfumes</span>
          <span>India · INR · GST-inclusive pricing</span>
        </div>
      </div>
    </footer>
  );
}
