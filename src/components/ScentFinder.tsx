'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { PRODUCTS } from '@/lib/data';
import ProductModal from './ProductModal';
import type { Product } from '@/lib/data';

const QUESTIONS = [
  {
    key: 'occasion',
    question: 'What occasion are you shopping for?',
    options: ['Daily Wear', 'Evening / Date Night', 'Office / Professional', 'Special Gift'],
  },
  {
    key: 'mood',
    question: 'What mood do you want to project?',
    options: ['Bold & Powerful', 'Fresh & Clean', 'Romantic & Warm', 'Soft & Elegant'],
  },
  {
    key: 'preference',
    question: 'Which scent family resonates with you?',
    options: ['Woody & Dark', 'Fresh & Citrus', 'Floral & Sweet', 'Oriental & Spicy'],
  },
];

const PROFILE_MAP: Record<string, string> = {
  'Daily Wear': 'Fresh',
  'Evening / Date Night': 'Oriental',
  'Office / Professional': 'Fresh',
  'Special Gift': 'Woody',
  'Bold & Powerful': 'Woody',
  'Fresh & Clean': 'Fresh',
  'Romantic & Warm': 'Oriental',
  'Soft & Elegant': 'Floral',
  'Woody & Dark': 'Woody',
  'Fresh & Citrus': 'Fresh',
  'Floral & Sweet': 'Floral',
  'Oriental & Spicy': 'Oriental',
};

export default function ScentFinder() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const answer = (opt: string) => {
    const next = [...answers, opt];
    if (step < QUESTIONS.length - 1) {
      setAnswers(next);
      setStep(step + 1);
    } else {
      // Determine profile from votes
      const profileVotes: Record<string, number> = {};
      next.forEach(a => {
        const p = PROFILE_MAP[a];
        if (p) profileVotes[p] = (profileVotes[p] || 0) + 1;
      });
      const topProfile = Object.entries(profileVotes).sort((a, b) => b[1] - a[1])[0]?.[0];
      const match = PRODUCTS.find(p => p.profile === topProfile) ?? PRODUCTS[0];
      setResult(match);
    }
  };

  const reset = () => { setStep(0); setAnswers([]); setResult(null); };

  return (
    <section ref={ref} className="py-28 px-6 bg-[#0a0a0a] relative overflow-hidden" id="find-your-scent">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D4AF37]/3 blur-[100px] pointer-events-none" />

      <div className="max-w-[700px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Sparkles size={18} className="text-[#D4AF37]" />
            <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase">Private Selection</p>
            <Sparkles size={18} className="text-[#D4AF37]" />
          </div>
          <h2 className="font-cinzel text-[clamp(32px,5vw,52px)] text-white tracking-widest mb-8">
            The Scent Finder
          </h2>
          <div className="divider-gold mb-10" />
          <p className="text-white/40 text-sm tracking-wide max-w-md mx-auto leading-relaxed">
            Embark on a sensory journey. Answer 3 questions and our algorithm will tailor a fragrance recommendation for your unique aura.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass border border-[#D4AF37]/10 p-10 md:p-20"
        >
          {!result ? (
            <div className="space-y-12">
              {/* Progress */}
              <div className="flex gap-4">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-[1px] flex-1 transition-all duration-700 ${
                      i <= step ? 'bg-[#D4AF37]' : 'bg-white/5'
                    }`}
                  />
                ))}
              </div>

              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <p className="text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase mb-6 opacity-60">Step {step + 1} / {QUESTIONS.length}</p>
                <h3 className="font-cinzel text-white text-2xl md:text-3xl mb-12 tracking-wide leading-tight">{QUESTIONS[step].question}</h3>

                <div className="grid grid-cols-1 gap-5">
                  {QUESTIONS[step].options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => answer(opt)}
                      className="text-left px-8 py-7 border border-white/5 text-white/50 hover:text-white hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all duration-500 text-sm tracking-[0.1em] group relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 w-[2px] h-0 bg-[#D4AF37] group-hover:h-full transition-all duration-500" />
                      <span className="text-[#D4AF37] mr-4 opacity-0 group-hover:opacity-100 transition-opacity">✦</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-6">Your Signature Awaits</p>
              <h3 className="font-cinzel text-white text-4xl md:text-5xl mb-4 tracking-wider">{result.name}</h3>
              <p className="text-[#D4AF37]/60 text-xs mb-8 tracking-[0.2em] font-medium uppercase">{result.profile} · {result.notes}</p>
              <p className="text-white/40 text-base mb-12 max-w-sm mx-auto leading-relaxed italic">{result.description}</p>
              <p className="text-white text-2xl font-light tracking-[0.1em] mb-12 italic">₹{result.price.toLocaleString()}</p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <button onClick={() => setModalOpen(true)} className="btn-gold px-12">Experience Now</button>
                <button onClick={reset} className="btn-ghost px-12">Search Again</button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {result && (
        <ProductModal product={result} open={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </section>
  );
}
