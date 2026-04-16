export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  profile: 'Woody' | 'Floral' | 'Fresh' | 'Oriental';
  collection: 'for-him' | 'for-her' | 'luxury';
  notes: string;
  longevity: string;
  mood: string;
  description: string;
  badge?: string;
  isNew?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: 'billionaire',
    name: 'Billionaire Noir',
    price: 1299,
    originalPrice: 1699,
    image: '/billionaire.png',
    profile: 'Woody',
    collection: 'for-him',
    notes: 'Bergamot, Cedarwood, Warm Amber',
    longevity: '8–10 hours',
    mood: 'Bold evenings & sharp impressions',
    description: 'A power scent with deep woody character and a smooth amber finish for statement wear.',
    badge: 'Bestseller',
  },
  {
    id: 'coldwar',
    name: 'Cold War',
    price: 999,
    image: '/coldwar.png',
    profile: 'Fresh',
    collection: 'for-him',
    notes: 'Mint, Pepper, Clean Musk',
    longevity: '6–8 hours',
    mood: 'Cool daytime confidence',
    description: 'Crisp and energetic with icy freshness — designed for active mornings and sharp office hours.',
    isNew: true,
  },
  {
    id: 'heavenly',
    name: 'Heavenly',
    price: 1099,
    originalPrice: 1399,
    image: '/heavenly.png',
    profile: 'Floral',
    collection: 'for-her',
    notes: 'White Florals, Powdery Iris, Soft Musk',
    longevity: '7–9 hours',
    mood: 'Soft elegance for daily wear',
    description: 'Balanced floral warmth with a gentle musk base that stays refined from day to evening.',
  },
  {
    id: 'old-love',
    name: 'Old Love',
    price: 1199,
    image: '/old-love.png',
    profile: 'Oriental',
    collection: 'for-her',
    notes: 'Vanilla, Saffron, Sweet Resin',
    longevity: '8–9 hours',
    mood: 'Warm nostalgic date nights',
    description: 'A comforting sweet oriental blend — ideal for romantic evenings and cooler weather.',
    badge: 'Limited',
  },
  {
    id: 'hero1',
    name: 'Obsidian Fire',
    price: 1599,
    image: '/hero1.png',
    profile: 'Woody',
    collection: 'luxury',
    notes: 'Oud, Black Pepper, Dark Amber',
    longevity: '10–12 hours',
    mood: 'Powerful statement, luxury events',
    description: 'An opulent oud-forward fragrance that commands presence. A luxury signature scent for the bold.',
    badge: 'Exclusive',
  },
  {
    id: 'combo',
    name: 'The Royal Duo',
    price: 1999,
    originalPrice: 2598,
    image: '/combo-pack.png',
    profile: 'Woody',
    collection: 'luxury',
    notes: 'Curated Mix — Billionaire + Cold War',
    longevity: 'Variable',
    mood: 'Perfect for gifting',
    description: 'Two signature scents curated into one premium gift set. An unbeatable value for the fragrance connoisseur.',
    badge: 'Bundle',
  },
];

export const HERO_SLIDES = [
  {
    id: 1,
    image: '/hero1.png',
    heading: 'OBSIDIAN',
    subheading: 'Where darkness becomes desire.',
    cta: 'Explore Collection',
  },
  {
    id: 2,
    image: '/billionaire.png',
    heading: 'BILLIONAIRE',
    subheading: 'Power. Ambition. Flawless character.',
    cta: 'Shop Now',
  },
  {
    id: 3,
    image: '/heavenly.png',
    heading: 'HEAVENLY',
    subheading: 'The scent of pure elegance.',
    cta: 'Discover More',
  },
  {
    id: 4,
    image: '/old-love.png',
    heading: 'OLD LOVE',
    subheading: 'A timeless, intimate emotion.',
    cta: 'Find Your Scent',
  },
];

export const COLLECTIONS = [
  { id: 'for-him', label: 'For Him', description: 'Bold, confident, commanding.', image: '/billionaire.png' },
  { id: 'for-her', label: 'For Her', description: 'Graceful, romantic, timeless.', image: '/heavenly.png' },
  { id: 'luxury', label: 'Luxury Picks', description: 'The rarest of the rare.', image: '/hero1.png' },
];

export const TESTIMONIALS = [
  { name: 'Arjun M.', rating: 5, text: 'Billionaire Noir is everything — I get compliments every single time I wear it. Worth every rupee.' },
  { name: 'Priya K.', rating: 5, text: 'Heavenly is my go-to signature scent now. Floral but not overwhelming. Lasts all day.' },
  { name: 'Rahul S.', rating: 5, text: 'The Royal Duo was a perfect gift. Premium packaging, incredible scents.' },
  { name: 'Ananya R.', rating: 5, text: 'Old Love is exactly that — warm, nostalgic, beautifully complex. My partner loves it.' },
  { name: 'Vikram P.', rating: 5, text: 'Cold War is my morning power walk scent. Crisp and clean. Absolutely love it.' },
];
