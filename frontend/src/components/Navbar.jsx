import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-white/20 bg-white/70 backdrop-blur shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-5">
        <Link href="/" className="font-display text-xl tracking-[0.2em] uppercase">
          amidaddy<span className="text-clay">.in</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-6 text-sm">
          <Link href="/">Shop</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/login">Login</Link>
          <Link
            href="/admin"
            className="rounded-full border border-black/20 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.2em]"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
