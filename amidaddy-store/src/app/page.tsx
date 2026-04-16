import HeroCarousel from "@/components/HeroCarousel";
import FeaturedCollections from "@/components/FeaturedCollections";
import ProductGrid from "@/components/ProductGrid";
import ScentFinder from "@/components/ScentFinder";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <FeaturedCollections />
      <ProductGrid />
      <ScentFinder />
      <Testimonials />
      <Footer />
    </main>
  );
}
