'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 inset-x-0 z-50 glass border-b border-surface-800/60"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 group-hover:bg-brand-500 transition-colors">
            <Plane className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">SAFAGO</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="#how-it-works"
            className="text-sm text-surface-400 hover:text-surface-100 transition-colors"
          >
            Cómo funciona
          </Link>
          <Link
            href="#benefits"
            className="text-sm text-surface-400 hover:text-surface-100 transition-colors"
          >
            Beneficios
          </Link>
        </div>

        <Link href="/chat">
          <Button size="sm">Comenzar viaje</Button>
        </Link>
      </nav>
    </motion.header>
  );
}
