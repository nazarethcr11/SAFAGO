'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0 bg-surface-900" />
      <div className="absolute inset-0 bg-hero-gradient" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #60a5fa 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-900/50 border border-brand-800/60 text-brand-300 text-sm font-medium mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Impulsado por inteligencia artificial
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.1}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-6"
        >
          Tu próximo viaje,
          <br />
          <span className="gradient-text">encontrado por IA</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.2}
          className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Los viajeros consultan hasta 38 sitios web antes de reservar un viaje. SAFAGO analiza
          tus preferencias en una sola conversación y te conecta con vuelos reales al mejor precio.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.3}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/chat">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Comenzar viaje gratis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
              Ver cómo funciona
            </Button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.4}
          className="mt-8 text-sm text-surface-500"
        >
          Sin tarjeta de crédito · Sin registro · 100% gratis
        </motion.p>

        {/* Mock chat preview */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.5}
          className="mt-16 max-w-2xl mx-auto"
        >
          <div className="glass rounded-2xl p-6 text-left shadow-card">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                S
              </div>
              <div className="bg-surface-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-surface-200 max-w-xs">
                ¡Hola! ¿A dónde quieres viajar? 🌍
              </div>
            </div>
            <div className="flex items-start gap-3 mb-4 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                T
              </div>
              <div className="bg-brand-600 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white max-w-xs">
                Quiero playa y relax, presupuesto ~$600
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                S
              </div>
              <div className="bg-surface-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-surface-200 max-w-xs">
                Perfecto 🌴 Encontré 4 destinos ideales: Cancún desde $420, Cartagena desde $320...
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
