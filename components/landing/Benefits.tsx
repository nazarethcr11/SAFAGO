'use client';

import { motion } from 'framer-motion';
import { Clock, Brain, TrendingDown, Shield } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Ahorra horas de búsqueda',
    description:
      'En lugar de comparar decenas de webs, SAFAGO agrega y filtra la información más relevante en segundos.',
    metric: '4h',
    metricLabel: 'promedio ahorrado por búsqueda',
  },
  {
    icon: Brain,
    title: 'Recomendaciones inteligentes',
    description:
      'La IA aprende de tus preferencias para recomendarte destinos que realmente se adaptan a ti, no a las tendencias.',
    metric: '94%',
    metricLabel: 'de satisfacción en recomendaciones',
  },
  {
    icon: TrendingDown,
    title: 'Encuentra los mejores precios',
    description:
      'Consultamos Google Flights en tiempo real y rastreamos cambios de precio para alertarte en el momento justo.',
    metric: '30%',
    metricLabel: 'de ahorro promedio detectado',
  },
  {
    icon: Shield,
    title: 'Sin sesgos comerciales',
    description:
      'SAFAGO no tiene acuerdos con aerolíneas ni hoteles. Te recomendamos lo que es mejor para ti, no lo que paga más comisión.',
    metric: '0',
    metricLabel: 'comisiones ocultas',
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="py-24 px-4 sm:px-6 bg-surface-950/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-brand-400 text-sm font-semibold tracking-wider uppercase">
            Por qué SAFAGO
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-white">
            Viajar inteligente, no más caro
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group glass rounded-2xl p-8 border border-surface-800/50 hover:border-brand-800/60 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-brand-900/50 border border-brand-800/50 flex items-center justify-center group-hover:bg-brand-800/50 transition-colors">
                  <benefit.icon className="w-6 h-6 text-brand-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-xl mb-2">{benefit.title}</h3>
                  <p className="text-surface-400 text-sm leading-relaxed mb-5">
                    {benefit.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-brand-400">{benefit.metric}</span>
                    <span className="text-xs text-surface-500">{benefit.metricLabel}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
