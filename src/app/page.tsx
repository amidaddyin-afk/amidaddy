import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import CuratedHero from "@/components/CuratedHero";

export default function Home() {
  return (
    <main>
      <CuratedHero />
      <section id="offers" className="border-y border-white/10 bg-[#0e0e0e] px-6 py-6 text-center text-lg text-white"><span className="font-semibold text-[#D4AF37]">100 ml Rs. 1,199</span><span className="mx-4 text-white/30">|</span>Discovery bottles: 1 for Rs. 199, 2 for Rs. 349, 4 for Rs. 699</section>
      <ProductGrid />
      <Footer />
    </main>
  );
}
