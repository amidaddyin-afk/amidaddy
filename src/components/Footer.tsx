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
            <h3>Explore</h3>
            <Link href="/shop">All fragrances</Link>
            <Link href="/scent-school">Scent school</Link>
            <Link href="/#scent-finder">Scent finder</Link>
            <Link href="/#story">Our story</Link>
          </div>
          <div>
            <h3>Client care</h3>
            <a href="mailto:support@amidaddy.com">Contact</a>
            <Link href="/policies/shipping-delivery">Shipping & delivery</Link>
            <Link href="/policies/returns-refunds-replacements">
              Returns & refunds
            </Link>
            <Link href="/policies/payment-terms">Payment terms</Link>
            <Link href="/account/orders">Track an order</Link>
          </div>
          <div>
            <h3>Legal</h3>
            <Link href="/policies/terms-conditions">Terms & conditions</Link>
            <Link href="/policies/privacy-policy">Privacy policy</Link>
          </div>
          <div>
            <h3>Your account</h3>
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Create account</Link>
            <Link href="/admin">Store admin</Link>
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
