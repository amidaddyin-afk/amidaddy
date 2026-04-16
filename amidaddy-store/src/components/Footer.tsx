export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 py-16 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-cinzel text-2xl text-white tracking-[0.2em] mb-4">AMIDADDY</h3>
            <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-4">Luxury Fragrances</p>
            <p className="text-white/30 text-sm leading-relaxed max-w-sm">
              Crafting bold, refined, and long-lasting scents for those who understand the art of personal expression.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-cinzel text-white text-xs tracking-[0.2em] uppercase mb-6">Explore</h4>
            <ul className="space-y-3">
              {['Collection', 'For Him', 'For Her', 'Luxury Picks', 'Find Your Scent'].map(l => (
                <li key={l}>
                  <a href="#" className="text-white/30 text-sm hover:text-[#D4AF37] transition-colors tracking-wide">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-cinzel text-white text-xs tracking-[0.2em] uppercase mb-6">Support</h4>
            <ul className="space-y-3">
              {['About Us', 'Contact', 'Shipping Policy', 'Returns', 'FAQ'].map(l => (
                <li key={l}>
                  <a href="#" className="text-white/30 text-sm hover:text-[#D4AF37] transition-colors tracking-wide">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs tracking-wider">
            © 2025 Amidaddy Perfumes. All rights reserved.
          </p>
          <p className="text-[#D4AF37]/40 text-xs tracking-wider font-cinzel">
            ✦ Luxury. Crafted. Scented. ✦
          </p>
        </div>
      </div>
    </footer>
  );
}
