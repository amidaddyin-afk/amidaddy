import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="container flex items-center justify-between py-5">
        <Link href="/" className="text-lg font-semibold tracking-[0.08em] uppercase">
          amidaddy.in
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-black/70 md:flex">
          <Link href="/">Home</Link>
          <Link href="#collection">Collection</Link>
          <Link href="#featured">Best Sellers</Link>
          <Link href="/cart">Cart</Link>
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/login" className="rounded-full border border-black/15 px-4 py-2">
            Login
          </Link>
          <Link href="/admin" className="rounded-full bg-ink px-4 py-2 text-white">
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
