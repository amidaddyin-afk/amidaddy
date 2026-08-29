import "server-only";

export type HeroSlide = {
  image: string;
  kicker: string;
  title: string;
  copy: string;
  href: string;
};

const campaigns = [
  {
    slug: "billionaire",
    count: 11,
    kicker: "Billionaire",
    title: "Enter like you mean it.",
    copy: "Bergamot, polished cedar and amber with a magnetic dry-down.",
    href: "/products/billionaire",
  },
  {
    slug: "coldwar",
    count: 10,
    kicker: "Cold War",
    title: "Clarity has a temperature.",
    copy: "Mineral freshness, pepper and clean musk cut through the noise.",
    href: "/products/coldwar",
  },
  {
    slug: "heavenly",
    count: 13,
    kicker: "Heavenly",
    title: "Leave a softer trace.",
    copy: "Pear, white florals and soft musk composed with quiet radiance.",
    href: "/products/heavenly",
  },
  {
    slug: "old-love",
    count: 14,
    kicker: "Old Love",
    title: "Some feelings stay.",
    copy: "Saffron, warm resin and vanilla, held close to the skin.",
    href: "/products/old-love",
  },
] as const;

const campaignSlides = campaigns.map((campaign) =>
  Array.from({ length: campaign.count }, (_, index) => ({
    image: `/gallery/${campaign.slug}/${String(index + 1).padStart(2, "0")}.webp`,
    kicker: campaign.kicker,
    title: campaign.title,
    copy: campaign.copy,
    href: campaign.href,
  })),
);

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

export function getRandomHeroSlides(): HeroSlide[] {
  const selected = campaignSlides.map((slides) => randomItem(slides));
  const selectedImages = new Set(selected.map((slide) => slide.image));
  const remaining = campaignSlides
    .flat()
    .filter((slide) => !selectedImages.has(slide.image));
  return shuffle([...selected, randomItem(remaining)]);
}
