import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Droplets,
  Sun,
  ThermometerSun,
} from "lucide-react";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Scent School",
  description:
    "Understand fragrance, learn how to wear it, and discover the AMI DADDY signature that feels like you.",
};

const signatures = [
  {
    name: "Cold War",
    family: "Fresh",
    mood: "Cold · Clean · Controlled",
    notes: "Plum · Juniper · Oakmoss",
    time: "6-8 hours",
    slug: "coldwar",
    image: "/curated/cold-war.JPG",
  },
  {
    name: "Heavenly",
    family: "Floral",
    mood: "Soft · Intimate · Ethereal",
    notes: "Vanilla orchid · Tonka bean · Brown sugar",
    time: "7-9 hours",
    slug: "heavenly",
    image: "/curated/heavenly.JPG",
  },
  {
    name: "Old Love",
    family: "Amber",
    mood: "Nostalgic · Romantic · Warm",
    notes: "Saffron · Amber · Fir resin",
    time: "8-9 hours",
    slug: "old-love",
    image: "/curated/products/old-love/detail.JPG",
  },
  {
    name: "Billionaire",
    family: "Woody",
    mood: "Powerful · Sophisticated · Magnetic",
    notes: "Whiskey · Spicy notes · Tobacco",
    time: "8-10 hours",
    slug: "billionaire",
    image: "/curated/billionaire.JPG",
  },
];

const timeline = [
  [
    "Ancient world",
    "Resins, oils, incense and fragrant plants shaped ritual, adornment and daily life across several cultures.",
  ],
  [
    "Ancient India",
    "Aromatic woods, spices, flowers and scented oils formed a long relationship with fragrance.",
  ],
  [
    "10th century",
    "Ibn Sina is widely associated with important advances in steam and hydro-distillation.",
  ],
  [
    "Mughal India",
    "Attars, incense and perfumed spaces became deeply embedded in court culture.",
  ],
  [
    "Europe",
    "Alcohol carriers supported lighter, more diffusive styles and the growth of modern perfume houses.",
  ],
  [
    "Today",
    "Natural materials, aroma molecules and creative composition meet in global modern perfumery.",
  ],
];

export default function ScentSchoolPage() {
  return (
    <main className="scent-school">
      <section className="school-hero">
        <Image
          src="/curated/hero-models-3.JPG"
          alt="AMI DADDY fragrance campaign"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="school-hero-shade" />
        <div className="school-hero-copy">
          <p className="eyebrow">AMI DADDY Scent School</p>
          <h1>
            Understand fragrance.
            <br />
            Wear it better.
          </h1>
          <p>
            A practical guide to perfume, India&apos;s fragrance heritage and
            the four signatures of AMI DADDY.
          </p>
          <a href="#perfume-101" className="lux-button">
            Begin the lesson <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <nav className="school-chapters" aria-label="Scent School chapters">
        <a href="#history">History</a>
        <a href="#attar">India & Attar</a>
        <a href="#perfume-101">Perfume 101</a>
        <a href="#wear">How to wear</a>
        <a href="#signatures">Meet AMI DADDY</a>
      </nav>

      <section className="school-section" id="history">
        <div className="school-intro">
          <p className="eyebrow">01 · The history of perfume</p>
          <h2 className="display-title">
            From smoke and flowers to modern fragrance.
          </h2>
          <p>
            Fragrance did not begin in one place. Traditions developed across
            regions and centuries, shaped by ritual, craft, trade and new ways
            of extracting aromatic materials.
          </p>
        </div>
        <div className="scent-timeline">
          {timeline.map(([era, copy], index) => (
            <article key={era}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{era}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="attar-feature" id="attar">
        <div className="attar-visual">
          <span>DEG</span>
          <i />
          <span>BHAPKA</span>
        </div>
        <div>
          <p className="eyebrow">02 · India & the art of attar</p>
          <h2 className="display-title">
            Kannauj: a living fragrance tradition.
          </h2>
          <p>
            Kannauj in Uttar Pradesh is widely recognised as a centre of
            traditional Indian attar production. In the deg-bhapka method,
            aromatic material and water are heated in a copper vessel; fragrant
            vapour travels to a receiving vessel and condenses, traditionally
            into a carrier such as sandalwood oil.
          </p>
          <p className="school-note">
            The craft is skill-intensive and temperature-sensitive. Stories and
            folklore around attar should be enjoyed as traditions, not confused
            with documented history.
          </p>
        </div>
      </section>

      <section className="school-section" id="perfume-101">
        <div className="school-intro">
          <p className="eyebrow">03 · Perfume 101</p>
          <h2 className="display-title">Learn the language.</h2>
        </div>
        <div className="term-grid">
          <article>
            <strong>EDP</strong>
            <p>
              Eau de Parfum commonly has a higher fragrance concentration than
              EDT, though concentration alone does not guarantee longevity.
            </p>
          </article>
          <article>
            <strong>Note</strong>
            <p>
              A material or smell impression used to describe part of a
              composition.
            </p>
          </article>
          <article>
            <strong>Accord</strong>
            <p>
              Several materials working together to create one unified smell
              impression.
            </p>
          </article>
          <article>
            <strong>Dry-down</strong>
            <p>
              The later stage after the opening settles and the deeper character
              appears.
            </p>
          </article>
        </div>
        <div className="note-evolution">
          <div>
            <span>Top</span>
            <strong>First impression</strong>
          </div>
          <div>
            <span>Heart</span>
            <strong>Main character</strong>
          </div>
          <div>
            <span>Base</span>
            <strong>Deep dry-down</strong>
          </div>
        </div>
      </section>

      <section className="wear-school" id="wear">
        <div>
          <p className="eyebrow">04 · How to wear perfume</p>
          <h2 className="display-title">A ritual made to last.</h2>
          <p>
            For all-day presence, apply 5–6 sprays to the body and 5–7 light
            sprays across your clothing. Our wear guarantee: on unwashed fabric,
            Ami Daddy perfume remains noticeable for two days or longer.
          </p>
        </div>
        <div className="wear-steps">
          <article>
            <Droplets />
            <span>01</span>
            <h3>5–6 on the body</h3>
            <p>Focus on the neck, upper chest and inner elbows.</p>
          </article>
          <article>
            <Clock3 />
            <span>02</span>
            <h3>5–7 on clothing</h3>
            <p>Mist evenly from a short distance for a lasting scent trail.</p>
          </article>
          <article>
            <Sun />
            <span>03</span>
            <h3>Let it settle</h3>
            <p>Do not rub. Let every sprayed area dry naturally.</p>
          </article>
          <article>
            <ThermometerSun />
            <span>04</span>
            <h3>Store it well</h3>
            <p>Avoid direct sun, high heat and large temperature swings.</p>
          </article>
        </div>
        <p className="safety-note">
          Avoid eyes, mouth and broken or irritated skin. Test delicate fabrics
          before spraying clothing.
        </p>
      </section>

      <section className="school-signatures" id="signatures">
        <div className="school-intro">
          <p className="eyebrow">05 · Meet AMI DADDY</p>
          <h2 className="display-title">Read the four signatures.</h2>
          <p>
            Begin with the feeling, then notice how the materials bring that
            personality to life.
          </p>
        </div>
        <div className="school-signature-grid">
          {signatures.map((item) => (
            <Link href={`/products/${item.slug}`} key={item.slug}>
              <div className="school-signature-image">
                <Image
                  src={item.image}
                  alt={`${item.name} perfume`}
                  fill
                  sizes="(max-width: 760px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
              <small>
                {item.family} · {item.time}
              </small>
              <h3>{item.name}</h3>
              <p>{item.mood}</p>
              <span>
                {item.notes} <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="school-final">
        <p className="eyebrow">Your next lesson is personal</p>
        <h2 className="display-title">Which feeling will you wear today?</h2>
        <div>
          <Link href="/#scent-finder" className="lux-button">
            Find your scent <ArrowRight size={16} />
          </Link>
          <Link href="/shop" className="text-link">
            Explore all fragrances <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
