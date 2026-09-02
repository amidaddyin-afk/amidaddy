import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import FooterAccountLinks from "@/components/FooterAccountLinks";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="mx-auto max-w-[1500px]">
        <div className="footer-top">
          <div>
            <Link href="/" className="footer-mark">
              AMIDADDY
            </Link>
            <p>Presence, before words.</p>
          </div>
          <div>
            <h3>Fragrances</h3>
            <Link href="/shop">Shop all</Link>
            <Link href="/#shop-100ml">100ml collection</Link>
            <Link href="/#shop-20ml">20ml collection</Link>
            <Link href="/#discovery-set">Pack of 4</Link>
          </div>
          <div>
            <h3>Client care</h3>
            <a href="mailto:support@amidaddy.in">support@amidaddy.in</a>
            <Link href="/policies/shipping-delivery">
              Shipping &amp; delivery
            </Link>
            <Link href="/policies/returns-refunds-replacements">
              Returns &amp; refunds
            </Link>
            <Link href="/account/orders">Track an order</Link>
          </div>
          <div>
            <h3>Company</h3>
            <Link href="/#story">Our story</Link>
            <Link href="/scent-school">Scent school</Link>
            <Link href="/policies/terms-conditions">
              Terms &amp; conditions
            </Link>
            <Link href="/policies/privacy-policy">Privacy policy</Link>
          </div>
          <div>
            <h3>Your account</h3>
            <FooterAccountLinks />
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Amidaddy Perfumes</span>
          <span>India · INR · GST-inclusive pricing</span>
          {/* Points at the sign-in page rather than /admin so the footer does
              not advertise the admin route itself. Non-admins who sign in here
              land on their account page. */}
          <Link href="/login?next=/admin" className="footer-admin-link">
            <ShieldCheck size={13} aria-hidden="true" />
            Admin login
          </Link>
        </div>
      </div>
    </footer>
  );
}
