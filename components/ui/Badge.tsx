import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'yellow' | 'red';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-surface-700 text-surface-300': variant === 'default',
          'bg-brand-900/60 text-brand-300 border border-brand-800': variant === 'blue',
          'bg-emerald-900/50 text-emerald-400 border border-emerald-800/50': variant === 'green',
          'bg-amber-900/50 text-amber-400 border border-amber-800/50': variant === 'yellow',
          'bg-red-900/50 text-red-400 border border-red-800/50': variant === 'red',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
