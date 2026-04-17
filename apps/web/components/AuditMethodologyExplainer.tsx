'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Swords, GitCompare, X } from 'lucide-react';

const DISMISS_KEY = 'shipwithai-audit-methodology-seen';

const METHODOLOGIES = [
  {
    id: 'feynman',
    icon: Brain,
    name: 'Feynman',
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    blurb: 'Business-logic sweep. We explain each contract as if teaching a peer — every step we can\'t justify becomes a finding.',
  },
  {
    id: 'nemesis',
    icon: Swords,
    name: 'Nemesis',
    accent: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    blurb: 'Adversarial loop. We attack our own findings, feed the counter-findings back, and iterate until nothing new surfaces.',
  },
  {
    id: 'state-inconsistency',
    icon: GitCompare,
    name: 'State Inconsistency',
    accent: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    blurb: 'Coupled-state desync hunt. Any op that mutates one variable without updating its partner is a bug waiting to ship.',
  },
];

export function AuditMethodologyExplainer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setVisible(localStorage.getItem(DISMISS_KEY) !== 'true');
  }, []);

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISS_KEY, 'true');
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="relative mx-auto max-w-3xl my-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm p-4">
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute top-2.5 right-2.5 p-1 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-semibold mb-1">
              How we audit
            </p>
            <p className="text-sm text-zinc-300 mb-3">
              Your contracts run through three methodologies, in order. Each one catches a different class of bug.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {METHODOLOGIES.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border ${m.border} ${m.bg} p-3`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon className={`w-3.5 h-3.5 ${m.accent}`} />
                      <span className={`text-xs font-semibold ${m.accent}`}>
                        {i + 1}. {m.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      {m.blurb}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
