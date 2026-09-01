import Link from "next/link";

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
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Create account</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Amidaddy Perfumes</span>
          <span>India · INR · GST-inclusive pricing</span>
          <Link href="/admin" className="footer-admin-link">
            Admin portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
