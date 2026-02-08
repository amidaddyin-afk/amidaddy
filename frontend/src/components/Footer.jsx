export default function Footer() {
  return (
    <footer className="mt-20 bg-cacao text-white">
      <div className="container grid gap-6 py-12">
        <div>
          <h2 className="font-display text-2xl">Stay close to new drops.</h2>
          <p className="text-white/70">
            Join the scent letter for early access, private offers, and launches.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/60">
          <span>© 2026 Amidaddy.in</span>
          <div className="flex items-center gap-5">
            <span>Privacy</span>
            <span>Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
