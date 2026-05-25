import Link from 'next/link';
import { Plane } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-surface-800/60 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-600">
              <Plane className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-white">SAFAGO</span>
          </Link>

          <p className="text-sm text-surface-500 text-center">
            Recomendaciones turísticas impulsadas por IA
          </p>

          <p className="text-sm text-surface-600">© 2026 SAFAGO. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
