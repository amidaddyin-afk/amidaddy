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
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles size={18} className="text-[#D4AF37]" />
            <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase">AI-Powered</p>
            <Sparkles size={18} className="text-[#D4AF37]" />
          </div>
          <h2 className="font-cinzel text-[clamp(28px,4vw,46px)] text-white tracking-wide mb-5">
            Find Your Scent
          </h2>
          <div className="divider-gold mb-6" />
          <p className="text-white/40 text-sm">
            Answer 3 quick questions and we&apos;ll match you with your perfect fragrance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass border border-[#D4AF37]/10 p-8 md:p-12"
        >
          {!result ? (
            <>
              {/* Progress */}
              <div className="flex gap-2 mb-8">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-[2px] flex-1 transition-all duration-500 ${
                      i <= step ? 'bg-[#D4AF37]' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-white/40 text-xs tracking-widest uppercase mb-3">Question {step + 1} of {QUESTIONS.length}</p>
                <h3 className="font-cinzel text-white text-xl mb-8 tracking-wide">{QUESTIONS[step].question}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUESTIONS[step].options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => answer(opt)}
                      className="text-left px-5 py-4 border border-white/10 text-white/60 hover:text-white hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all duration-300 text-sm tracking-wide group"
                    >
                      <span className="text-[#D4AF37] mr-2 opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-4">Your Perfect Match</p>
              <h3 className="font-cinzel text-white text-3xl mb-2">{result.name}</h3>
              <p className="text-white/40 text-sm mb-2 tracking-wider">{result.profile} · {result.notes}</p>
              <p className="text-white/50 text-sm mb-8 max-w-sm mx-auto leading-relaxed">{result.description}</p>
              <p className="text-white text-xl font-semibold mb-6">₹{result.price.toLocaleString()}</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={() => setModalOpen(true)} className="btn-gold">View & Add to Cart</button>
                <button onClick={reset} className="btn-ghost">Try Again</button>
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
