'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import { ObservatoryView } from '@/app/dashboard/observatory/page';

interface ObservatoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function ObservatoryModal({ open, onClose }: ObservatoryModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-stretch justify-center modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-6xl mx-4 my-6 border border-zinc-800 bg-[#0a0a0d] shadow-2xl shadow-black/70 flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-[#0c0c10]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-500" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Observatory
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close observatory"
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-zinc-700 hover:border-brand-500 hover:bg-brand-500/10 hover:text-brand-400 text-zinc-300 transition-colors group"
              >
                <X className="w-4 h-4" />
                <span className="font-mono text-[10px] uppercase tracking-[0.15em]">Close</span>
                <kbd className="font-mono text-[9px] text-zinc-500 group-hover:text-brand-400 border border-zinc-700 px-1 py-0.5 rounded-sm ml-1">
                  ESC
                </kbd>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ObservatoryView />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
