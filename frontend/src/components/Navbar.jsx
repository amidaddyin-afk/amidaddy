import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-white/20 bg-white/70 backdrop-blur shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <div className="bg-ink text-white">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-2 text-[11px] uppercase tracking-[0.3em]">
          <span>Free shipping on orders over 999</span>
          <span>Limited drops every 21 days</span>
        </div>
      </div>
      <div className="container flex flex-wrap items-center justify-between gap-4 py-5">
        <Link href="/" className="font-display text-xl tracking-[0.2em] uppercase">
          amidaddy<span className="text-clay">.in</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-6 text-sm text-black/70">
          <Link href="#collections">Collections</Link>
          <Link href="#discovery">Discovery set</Link>
          <Link href="#featured">Featured</Link>
          <Link href="#reviews">Reviews</Link>
          <Link href="/cart">Cart</Link>
        </nav>
        <div className="flex items-center gap-3 text-xs">
          <Link href="/login" className="uppercase tracking-[0.2em] text-black/60">
            Login
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-black/20 bg-white/70 px-4 py-2 uppercase tracking-[0.2em]"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
