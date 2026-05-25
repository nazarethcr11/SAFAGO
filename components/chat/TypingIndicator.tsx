import { LoadingDots } from '@/components/ui/LoadingDots';

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
        S
      </div>
      <div className="bg-surface-800 border border-surface-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
        <LoadingDots />
      </div>
    </div>
  );
}
