import Image from 'next/image';
import { MapPin, Thermometer, Star, ExternalLink } from 'lucide-react';
import { Destination } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/utils/formatters';
import { buildTripAdvisorUrl } from '@/lib/tripAdvisorUrls';

interface DestinationCardProps {
  destination: Destination;
}

export function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <div className="group glass rounded-2xl overflow-hidden border border-surface-700/50 hover:border-brand-700/60 transition-all duration-300 hover:shadow-glow-blue w-64 flex-shrink-0">
      <div className="relative h-36 overflow-hidden">
        <Image
          src={destination.imageUrl}
          alt={destination.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="256px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 to-transparent" />
        {destination.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-surface-900/70 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium text-white">{destination.rating}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h4 className="text-white font-semibold text-base">{destination.name}</h4>
          <span className="text-brand-400 font-bold text-sm">
            {formatPrice(destination.estimatedPrice, destination.currency)}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3 text-xs text-surface-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {destination.country}
          </span>
          <span className="flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            {destination.climate}
          </span>
        </div>

        <p className="text-surface-400 text-xs leading-relaxed mb-3 line-clamp-2">
          {destination.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {(destination.tags ?? []).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="blue">
              {tag}
            </Badge>
          ))}
        </div>

        <a
          href={buildTripAdvisorUrl(destination)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-surface-700 hover:bg-surface-600 active:bg-surface-800 text-surface-200 text-xs font-semibold transition-colors duration-200"
        >
          Ver reseñas
          <ExternalLink className="w-3 h-3" strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
}
