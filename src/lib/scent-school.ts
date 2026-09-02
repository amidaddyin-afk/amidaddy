/**
 * Scent School curriculum.
 *
 * The section used to be one long page with anchor links, so every chapter
 * competed for the same screen and nothing felt like a lesson you could start,
 * finish and come back to. Each chapter is now its own route under
 * /scent-school/<slug>, and this module is the single source for the hub
 * index, the chapter pages, the prev/next rail and the sitemap.
 *
 * Content follows the brand's Scent School concept document. Historical claims
 * are deliberately hedged the way that document asks - "widely associated
 * with", "one of the best-documented" - and the chapters that make them carry
 * their sources.
 */

export type LessonBlock =
  | { kind: "prose"; body: string[] }
  | { kind: "timeline"; items: [string, string][] }
  | { kind: "terms"; items: [string, string][] }
  | { kind: "steps"; items: [string, string][] }
  | { kind: "pyramid" }
  | { kind: "deg" }
  | { kind: "signatures" }
  | { kind: "note"; title: string; body: string };

export interface Lesson {
  slug: string;
  /** Display index, e.g. "01". Derived from position, never hand-written. */
  number: string;
  /** Short label used in the chapter rail and the hub cards. */
  title: string;
  /** Full display headline on the chapter page. */
  heading: string;
  /** One line on the hub card and as the page description. */
  summary: string;
  /** Opening paragraph on the chapter page. */
  lede: string;
  minutes: number;
  image: string;
  imageAlt: string;
  blocks: LessonBlock[];
  /** The one thing to remember, pulled out at the end of the lesson. */
  takeaway: string;
  sources?: string[];
}

const LESSONS: Omit<Lesson, "number">[] = [
  {
    slug: "history",
    title: "The history of perfume",
    heading: "From smoke and flowers to modern fragrance.",
    summary:
      "How several regions, over many centuries, arrived at the bottle on your shelf.",
    lede: "Fragrance did not begin in one place. Traditions developed across regions and centuries, shaped by ritual, craft, trade and new ways of drawing scent out of raw material.",
    minutes: 6,
    image: "/curated/hero-models-2.webp",
    imageAlt:
      "Amidaddy Perfumes models photographed together for a fragrance campaign",
    blocks: [
      {
        kind: "prose",
        body: [
          "It is tempting to name one civilisation as the inventor of perfume. The honest answer is that many cultures arrived at fragrance independently, because the materials were everywhere: resin that smelled better burning than raw, flowers that held their scent in fat, wood that sweetened a room.",
          "What changed over time was not the desire but the technique. Each advance in extraction made scent easier to capture, carry and keep.",
        ],
      },
      {
        kind: "timeline",
        items: [
          [
            "Ancient world",
            "Fragrant plants, resins, oils and incense were used for ritual, adornment and daily life. Ancient Egypt is one of the best-documented early perfumery traditions.",
          ],
          [
            "Ancient India",
            "Aromatic woods, spices, flowers and scented oils formed a long relationship with fragrance, supported by both historical sources and archaeological evidence.",
          ],
          [
            "10th century",
            "Ibn Sina (Avicenna) is widely associated with important advances in the steam and hydro-distillation of aromatic materials.",
          ],
          [
            "Mughal India",
            "Attars, incense and perfumed spaces became deeply embedded in court culture, and Kannauj's traditional industry received significant patronage.",
          ],
          [
            "Europe",
            "Alcohol became an important carrier in later European perfumery, supporting lighter, more diffusive styles and the growth of modern perfume houses.",
          ],
          [
            "Today",
            "Natural materials, aroma molecules, modern extraction and creative composition meet in a global fragrance culture.",
          ],
        ],
      },
      {
        kind: "note",
        title: "How to read a fragrance history",
        body: "Perfume attracts good stories, and good stories harden into facts. Where a date or an origin has several versions, treat it as an account rather than a settled record.",
      },
    ],
    takeaway:
      "Perfume has no single inventor. Every tradition you can name was solving the same problem with the materials it had.",
    sources: [
      "National Geographic — “This ancient city is the perfume capital of India” (2020)",
      "The Indian Express — “How Kannauj is preserving a long fragrant tradition” (2022)",
      "Perfumer & Flavorist — “Attars of India: A Unique Aroma” (1991)",
    ],
  },
  {
    slug: "attar",
    title: "India & the art of attar",
    heading: "Kannauj: a living fragrance tradition.",
    summary:
      "Copper, steam, sandalwood and patience — the craft behind Indian attar.",
    lede: "India's fragrance heritage is not a museum piece. In Kannauj, attar is still made by a method that predates every machine in a modern perfumery.",
    minutes: 7,
    image: "/gallery/old-love/06.webp",
    imageAlt:
      "Amidaddy Perfumes Old Love Eau de Parfum photographed in warm light",
    blocks: [
      {
        kind: "prose",
        body: [
          "Kannauj in Uttar Pradesh is widely recognised as a major centre of traditional Indian attar production. Sources describe centuries of fragrance-making there, including the deg-bhapka method still practised today.",
        ],
      },
      { kind: "deg" },
      {
        kind: "prose",
        body: [
          "Aromatic material and water are heated in a copper vessel, the deg. Fragrant vapour travels through a connecting pipe into a receiving vessel, the bhapka, where it condenses — traditionally into a carrier such as sandalwood oil rather than into water.",
          "There is no dial to set. The process is skill-intensive and temperature-sensitive, and the person tending the fire is reading it by eye, by sound and by smell across hours.",
        ],
      },
      {
        kind: "terms",
        items: [
          [
            "Mitti attar",
            "The smell of the first rain on dry earth, captured from baked clay. Petrichor, bottled.",
          ],
          [
            "Rose & jasmine",
            "The classical florals of Indian attar, distilled at scale in season and aged afterwards.",
          ],
          [
            "Vetiver & sandalwood",
            "Roots and heartwood that carry other materials and deepen as they age.",
          ],
          [
            "Kewra",
            "Screw pine — sweet, green and distinctly South Asian in character.",
          ],
        ],
      },
      {
        kind: "note",
        title: "Enjoy the folklore as folklore",
        body: "Accounts connecting Noor Jahan with the discovery of rose attar are part of the tradition around the craft. They are worth telling, and worth keeping separate from the better-documented record.",
      },
    ],
    takeaway:
      "Attar is a carrier craft: the scent is captured into oil, not alcohol, and it is expected to improve with age.",
    sources: [
      "National Geographic — “This ancient city is the perfume capital of India” (2020)",
      "The Indian Express — “How Kannauj is preserving a long fragrant tradition” (2022)",
      "Government of India / KVIC — Ittar manufacturing profile",
    ],
  },
  {
    slug: "perfume-101",
    title: "Perfume 101",
    heading: "Learn the language.",
    summary:
      "EDP, EDT, notes, accords and families — the six words that unlock every label.",
    lede: "Most fragrance vocabulary exists to describe one of two things: how much scent is in the bottle, and what the scent is made of. Six terms cover almost all of it.",
    minutes: 5,
    image: "/curated/product-detail-1.webp",
    imageAlt: "Amidaddy Perfumes bottles arranged in warm studio light",
    blocks: [
      {
        kind: "terms",
        items: [
          [
            "Eau de Parfum (EDP)",
            "A format that commonly carries a higher fragrance concentration than EDT. Concentration alone does not guarantee longevity.",
          ],
          [
            "Eau de Toilette (EDT)",
            "A lighter format, often built for a more airy, diffusive effect.",
          ],
          [
            "Note",
            "A single material or smell impression used to describe part of a composition.",
          ],
          [
            "Accord",
            "Several materials working together so closely that they read as one smell.",
          ],
          [
            "Fragrance family",
            "The broad category a scent belongs to: fresh, floral, woody, amber, gourmand or aromatic.",
          ],
          [
            "Dry-down",
            "The later stage, after the opening has settled and the deeper character comes forward.",
          ],
        ],
      },
      {
        kind: "note",
        title: "Concentration is not longevity",
        body: "A higher percentage means more fragrance oil in the bottle. How long you smell it depends just as much on the materials, your skin and where you sprayed it.",
      },
    ],
    takeaway:
      "A note is a single material. An accord is several behaving as one. A family is the neighbourhood they live in.",
  },
  {
    slug: "understand-your-perfume",
    title: "Understand your perfume",
    heading: "A fragrance is not one smell.",
    summary:
      "Top, heart and base — why the scent you buy is not the scent you wear at hour four.",
    lede: "The opening is an introduction, not the fragrance. What you smell in the first ninety seconds has largely gone by the time anyone else has an opinion about it.",
    minutes: 5,
    image: "/gallery/heavenly/06.webp",
    imageAlt: "Amidaddy Perfumes Heavenly Eau de Parfum held in soft daylight",
    blocks: [
      { kind: "pyramid" },
      {
        kind: "prose",
        body: [
          "Materials evaporate at different rates. The lightest ones announce the fragrance and leave; the heaviest ones are still there hours later. That is the whole mechanism — a perfume is a sequence, and it is composed to be one.",
          "This is why testing on a paper strip at a counter tells you so little. You are meeting the introduction and deciding about the character.",
        ],
      },
      {
        kind: "note",
        title: "Give it thirty minutes",
        body: "Before you judge a fragrance, let it reach its heart on your own skin. If you still like it at the half-hour mark, you will likely like wearing it.",
      },
    ],
    takeaway:
      "Judge a fragrance by its heart and dry-down, not its opening. The opening is the part that leaves.",
  },
  {
    slug: "how-to-wear",
    title: "How to wear perfume",
    heading: "Where it goes, and how much.",
    summary:
      "Placement, quantity and the one habit that quietly ruins an opening.",
    lede: "Fragrance rises and it needs warmth. Almost every rule about application follows from those two facts.",
    minutes: 4,
    image: "/gallery/coldwar/03.webp",
    imageAlt:
      "Amidaddy Perfumes Cold War Eau de Parfum held against a white shirt",
    blocks: [
      {
        kind: "steps",
        items: [
          [
            "Neck and upper chest",
            "The classic placement. Warm, close to where people actually greet you, and reliably diffusive.",
          ],
          [
            "Behind the ears",
            "Traditional and convenient, for a scent that stays in your own orbit rather than the room's.",
          ],
          [
            "Inner elbows",
            "Warmth and movement together, which keeps the fragrance releasing through the day.",
          ],
          [
            "Wrists — but do not rub",
            "Convenient, but rubbing them together crushes the opening and can flatten what follows.",
          ],
          [
            "Clothing",
            "Extends the experience considerably, and holds longest of all. Test delicate fabrics first.",
          ],
        ],
      },
      {
        kind: "note",
        title: "Start at two to four sprays",
        body: "Then adjust for the fragrance's strength, the weather, the room and your own preference. More is not automatically better — and you will stop smelling your own perfume long before anyone near you does.",
      },
      {
        kind: "prose",
        body: [
          "Avoid eyes, mouth, and broken or irritated skin. If you are sensitive to fragrance, patch-test first or follow your clinician's advice.",
        ],
      },
    ],
    takeaway:
      "Warm places, a light hand, and never rub your wrists together after spraying.",
  },
  {
    slug: "make-it-last",
    title: "Make your perfume last",
    heading: "Longevity is not a competition.",
    summary: "Six habits that get more hours out of the bottle you own.",
    lede: "Most longevity problems are not the fragrance. They are dry skin, a rushed application or a bottle kept somewhere warm.",
    minutes: 4,
    image: "/curated/product-detail-2.webp",
    imageAlt: "Amidaddy Perfumes bottles photographed in studio light",
    blocks: [
      {
        kind: "steps",
        items: [
          [
            "Start with moisturised skin",
            "Fragrance generally holds better on moisturised skin than on very dry skin, which lets it evaporate away.",
          ],
          [
            "Apply after showering",
            "Clean, warm, slightly damp skin is the best starting point you get all day.",
          ],
          [
            "Do not rub it in",
            "Let each sprayed area dry on its own. Rubbing works against the opening you paid for.",
          ],
          [
            "Use the right amount",
            "Build up gradually rather than opening with a cloud. You can always add.",
          ],
          [
            "Let clothing help",
            "Fabric holds fragrance far longer than skin. Test the material first.",
          ],
          [
            "Store it properly",
            "Closed, out of direct sunlight, away from heat and large temperature swings. A bathroom windowsill is the worst place in the house.",
          ],
        ],
      },
      {
        kind: "note",
        title: "The right amount",
        body: "It is the amount that lets you enjoy the fragrance without deciding the mood of everyone in the lift with you.",
      },
    ],
    takeaway:
      "Moisturised skin, an unrubbed application and a cool dark shelf will beat any trick.",
  },
  {
    slug: "learn-your-nose",
    title: "Learn your nose",
    heading: "A ten-minute exercise.",
    summary:
      "Train the one instrument that decides which fragrance is actually yours.",
    lede: "You do not need vocabulary to smell well. You need attention, and a habit of writing down what you noticed before you talk yourself out of it.",
    minutes: 10,
    image: "/gallery/heavenly/09.webp",
    imageAlt:
      "Amidaddy Perfumes Heavenly Eau de Parfum held close for a first impression",
    blocks: [
      {
        kind: "steps",
        items: [
          ["Spray", "One spray, on a blotter or on your own skin. Just one."],
          [
            "Immediately",
            "Write down the first three words that arrive. Do not edit them and do not reach for perfume language — “cold” and “clean laundry” are better data than “aldehydic”.",
          ],
          [
            "At ten minutes",
            "Smell it again. What changed? Something always has.",
          ],
          [
            "At thirty to sixty minutes",
            "This is the dry-down, and this is the fragrance you would actually be wearing.",
          ],
          [
            "Then rest",
            "Try the next one only after your nose has had a break. Coffee beans do not reset it; time does.",
          ],
        ],
      },
      {
        kind: "note",
        title: "Why the writing matters",
        body: "Smell reaches memory before it reaches language. Writing the first three words catches the honest reaction before you start reasoning about whether you should like it.",
      },
    ],
    takeaway:
      "Three words, three times, one fragrance. Do this twice and you will know your own taste better than any quiz can tell you.",
  },
  {
    slug: "signatures",
    title: "Meet Amidaddy Perfumes",
    heading: "Read the four signatures.",
    summary:
      "Put the whole course to work on Cold War, Heavenly, Old Love and Billionaire.",
    lede: "Begin with the feeling, then notice how the materials build that personality. This is the same reading you would give any fragrance — practised on ours.",
    minutes: 5,
    image: "/curated/hero-models-3.webp",
    imageAlt:
      "The four Amidaddy Perfumes signatures photographed together for a campaign",
    blocks: [
      { kind: "signatures" },
      {
        kind: "note",
        title: "Four moods, one house",
        body: "The four are composed to sit beside each other rather than compete. Most people find one that is unmistakably theirs, and a second for the evenings.",
      },
    ],
    takeaway:
      "Family tells you the neighbourhood, notes tell you the materials, and the mood tells you when you will actually reach for it.",
  },
];

export const LESSONS_WITH_NUMBERS: Lesson[] = LESSONS.map((lesson, index) => ({
  ...lesson,
  number: String(index + 1).padStart(2, "0"),
}));

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS_WITH_NUMBERS.find((lesson) => lesson.slug === slug);
}

/** The lesson before and after this one, for the end-of-chapter rail. */
export function getLessonNeighbours(slug: string) {
  const index = LESSONS_WITH_NUMBERS.findIndex(
    (lesson) => lesson.slug === slug,
  );
  return {
    previous: index > 0 ? LESSONS_WITH_NUMBERS[index - 1] : undefined,
    next:
      index >= 0 && index < LESSONS_WITH_NUMBERS.length - 1
        ? LESSONS_WITH_NUMBERS[index + 1]
        : undefined,
  };
}

export const TOTAL_MINUTES = LESSONS_WITH_NUMBERS.reduce(
  (total, lesson) => total + lesson.minutes,
  0,
);
