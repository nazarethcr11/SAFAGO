'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Plane, Calendar } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    step: '01',
    title: 'Cuéntale tus preferencias',
    description:
      'Escribe de forma natural. ¿Playa o montaña? ¿Solo o en familia? ¿Cuánto tienes de presupuesto? SAFAGO entiende tu lenguaje.',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'La IA analiza y recomienda',
    description:
      'Nuestro motor de IA procesa tus preferencias y recomienda destinos personalizados con información de clima, cultura y precio estimado.',
  },
  {
    icon: Plane,
    step: '03',
    title: 'Busca vuelos en tiempo real',
    description:
      'Cuando confirmas un destino, consultamos Google Flights en tiempo real para encontrar los mejores vuelos disponibles.',
  },
  {
    icon: Calendar,
    step: '04',
    title: 'Elige y viaja',
    description:
      'Compara precios, horarios y escalas. SAFAGO rastrea cambios de precio y te alerta cuando hay mejores ofertas.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-brand-400 text-sm font-semibold tracking-wider uppercase">
            Cómo funciona
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-white">
            De conversación a vuelo en minutos
          </h2>
          <p className="mt-4 text-surface-400 text-lg max-w-2xl mx-auto">
            Sin formularios interminables. Sin comparar 20 pestañas. Solo una conversación natural.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative group"
            >
              <div className="glass rounded-2xl p-6 h-full border border-surface-800/50 hover:border-brand-800/60 transition-all duration-300 hover:shadow-glow-blue">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-900/60 border border-brand-800/60 group-hover:bg-brand-800/60 transition-colors">
                    <step.icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <span className="text-4xl font-black text-surface-800 group-hover:text-surface-700 transition-colors">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{step.description}</p>
              </div>

              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/3 -right-3 w-6 h-px bg-gradient-to-r from-brand-800/60 to-transparent z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
