/**
 * Scent School — "From a note to a feeling."
 *
 * Seven scroll-driven chapters that carry a visitor from raw material to a
 * finished signature, with the eight written lessons in src/lib/scent-school.ts
 * remaining the long-form source. Chapters link into those lessons via
 * `chapter`, so nothing here duplicates the curriculum: it is a way in.
 *
 * Factual discipline, carried over from scent-school.ts and the brief:
 *   - Laboratory scenes are labelled an illustrated introduction to perfumery.
 *     They are educational illustration, never a depiction of Amidaddy's own
 *     facility, and no extraction method, sourcing route, formulation
 *     percentage or maturation period is attributed to the brand.
 *   - A note is an olfactory impression, not a guaranteed literal ingredient
 *     in the formula. `NOTE_FAMILIES` below says so on the page.
 *   - Top/heart/base are overlapping perceptual stages, not fixed timers, so
 *     no chapter states a universal duration.
 *
 * Imagery: each chapter names an `image` under /public/scent-school/. Those
 * files are commissioned art that is not in the repo yet; ChapterScene renders
 * a composed gradient in their place until they land, so the page is complete
 * and readable either way. Drop a file at the named path to light a chapter up.
 */

export interface Chapter {
  id: string;
  /** Display index, "01".."07". Derived from position, never hand-written. */
  number: string;
  /** Two words at most — used in the chapter index rail. */
  label: string;
  heading: string;
  /** One short line under the heading. */
  standfirst: string;
  /** One or two sentences of body copy. */
  body: string;
  /**
   * Basename of the scroll-scrubbed film under /public/scent-school/film/,
   * e.g. "notes" resolves to notes-desktop.mp4 / notes-mobile.mp4 plus their
   * .jpg posters. Written by scripts/encode-scent-school.mjs. Chapters
   * without footage omit this and use `image` instead.
   */
  film?: string;
  /**
   * Still fallback for chapters with no film. Optional: chapters 06 and 07
   * were not supplied footage or art, and render a composed gradient rather
   * than requesting a file that does not exist.
   */
  image?: string;
  imageAlt: string;
  /**
   * Shown over laboratory and process imagery. The brief requires this label
   * wherever perfumery equipment appears, so it cannot read as documentary
   * footage of the brand's own production.
   */
  illustrationNotice?: boolean;
  /** Slug under /scent-school/ covering this ground in full, if any. */
  chapter?: string;
}

const CHAPTERS: Omit<Chapter, "number">[] = [
  {
    id: "notes",
    film: "notes",
    label: "The notes",
    heading: "Meet the notes",
    standfirst: "A scent starts with character.",
    body: "Citrus brings brightness. Floral adds soul. Woody gives depth. Together they create a language all their own.",
    image: "/scent-school/01-notes.webp",
    imageAlt:
      "Bergamot peel, jasmine petals and cedar fragments arranged in low light",
    chapter: "perfume-101",
  },
  {
    id: "essence",
    film: "extraction",
    label: "The essence",
    heading: "Capture the essence",
    standfirst: "An illustrated introduction to perfumery.",
    body: "Through time, temperature and care, a raw material gives up its most expressive form. Different materials call for different methods — and some of the most useful ones are built in a laboratory rather than drawn from a plant.",
    image: "/scent-school/02-essence.webp",
    imageAlt:
      "Generic perfumery glassware with condensation collecting into a droplet",
    illustrationNotice: true,
    chapter: "history",
  },
  {
    id: "balance",
    film: "blending",
    label: "The balance",
    heading: "Compose the balance",
    standfirst: "Every note has a place.",
    body: "A great fragrance is a harmony. Top notes spark, heart notes unfold, base notes linger — and they overlap rather than take turns.",
    image: "/scent-school/03-balance.webp",
    imageAlt: "A pipette releasing a single drop into a glass beaker",
    illustrationNotice: true,
    chapter: "understand-your-perfume",
  },
  {
    id: "time",
    film: "resting",
    label: "Time",
    heading: "Give it time",
    standfirst: "Blend. Rest. Refine.",
    body: "Fragrances evolve. Evaluation and preparation take as long as the formula asks for, and the waiting is part of the making rather than a pause in it.",
    image: "/scent-school/04-time.webp",
    imageAlt: "Amber liquid resting in a glass vessel, lit from behind",
    illustrationNotice: true,
    chapter: "perfume-101",
  },
  {
    id: "skin",
    film: "skin",
    label: "On skin",
    heading: "Let it unfold",
    standfirst: "A different story on everyone.",
    body: "Fragrance lives and breathes on skin, interacting with your own chemistry, the weather and how you applied it to create something personal.",
    image: "/scent-school/05-skin.webp",
    imageAlt: "A wrist in natural daylight, just after application",
    chapter: "understand-your-perfume",
  },
  {
    id: "curiosity",
    label: "Curiosity",
    heading: "Follow your curiosity",
    standfirst: "Explore. Learn. Go deeper.",
    body: "Fragrance is a journey of endless discovery. Here are a few places to continue yours.",
    imageAlt: "An open book and dried botanicals on a worn desk by a window",
  },
  {
    id: "signature",
    label: "Your signature",
    heading: "Find your signature",
    standfirst: "Different stories. A similar soul.",
    body: "Four compositions, built to sit beside each other rather than compete.",
    imageAlt: "The Amidaddy collection photographed together",
  },
];

export const CHAPTERS_WITH_NUMBERS: Chapter[] = CHAPTERS.map(
  (chapter, index) => ({
    ...chapter,
    number: String(index + 1).padStart(2, "0"),
  }),
);

export const TOTAL_CHAPTERS = CHAPTERS_WITH_NUMBERS.length;

/**
 * The three families introduced in chapter 01.
 *
 * `caveat` is rendered as an expandable line on the page: a note names the
 * impression a fragrance gives, which is not the same claim as naming what is
 * physically in the bottle.
 */
export const NOTE_FAMILIES = [
  {
    id: "citrus",
    name: "Citrus",
    line: "Bright. Lively. Uplifting.",
  },
  {
    id: "floral",
    name: "Floral",
    line: "Soft. Expressive. Human.",
  },
  {
    id: "woody",
    name: "Woody",
    line: "Warm. Grounded. Enduring.",
  },
] as const;

export const NOTES_CAVEAT =
  "A note describes how something smells, not what is literally in the formula. A “leather” note is usually built from other materials entirely, and a listed flower may be an accord rather than an extract.";

/** The three perceptual stages in chapter 03 and the timeline in chapter 05. */
export const PYRAMID = [
  {
    id: "top",
    name: "Top",
    line: "The first impression. Bright and immediate.",
  },
  {
    id: "heart",
    name: "Heart",
    line: "The soul of the fragrance. Rich and evolving.",
  },
  { id: "base", name: "Base", line: "What remains. Deep and memorable." },
] as const;

export const WEAR_TIMELINE = [
  { id: "first", name: "First impression", line: "A captivating spark." },
  { id: "heart", name: "The heart", line: "It evolves with you." },
  { id: "remains", name: "What remains", line: "A lasting connection." },
] as const;
