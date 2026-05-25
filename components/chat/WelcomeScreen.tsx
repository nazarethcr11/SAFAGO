'use client';

import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';
import { QUICK_PROMPTS } from '@/utils/constants';

interface WelcomeScreenProps {
  onPromptSelect: (prompt: string) => void;
}

export function WelcomeScreen({ onPromptSelect }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center flex-1 px-4 py-16 text-center"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 mb-6 shadow-glow-blue">
        <Plane className="w-8 h-8 text-white" strokeWidth={2} />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">SAFAGO</h1>
      <p className="text-surface-400 text-base max-w-sm mb-10">
        Tu asistente de viajes con IA. Cuéntame a dónde quieres ir y te ayudo a encontrar las
        mejores opciones.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {QUICK_PROMPTS.map((prompt) => (
          <motion.button
            key={prompt.text}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPromptSelect(prompt.text)}
            className="flex items-start gap-3 p-4 rounded-xl bg-surface-800 border border-surface-700/60 hover:border-brand-700/60 hover:bg-surface-750 transition-all duration-200 text-left group"
          >
            <span className="text-xl">{prompt.emoji}</span>
            <span className="text-sm text-surface-300 group-hover:text-surface-100 transition-colors leading-relaxed">
              {prompt.text}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
