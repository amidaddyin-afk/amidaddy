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
            <Link href="/#scent-finder">Scent finder</Link>
            <Link href="/#story">Our story</Link>
          </div>
          <div>
            <h3>Client care</h3>
            <a href="mailto:support@amidaddy.com">Contact</a>
            <Link href="/#faq">Shipping & cancellation</Link>
            <Link href="/account/orders">Track an order</Link>
          </div>
          <div>
            <h3>Your account</h3>
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Create account</Link>
            <Link href="/admin">Store admin</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Amidaddy Parfums</span>
          <span>India · INR · GST-inclusive pricing</span>
        </div>
      </div>
    </footer>
  );
}
