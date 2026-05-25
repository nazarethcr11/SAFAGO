import { Plane, Clock, ArrowRight } from 'lucide-react';
import { Flight } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDuration, formatFlightTime } from '@/utils/formatters';

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  const [origin, destination] = flight.route.split('-');

  return (
    <div className="glass rounded-2xl border border-surface-700/50 hover:border-brand-700/60 transition-all duration-300 p-4 w-72 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-surface-700 flex items-center justify-center">
            <Plane className="w-3.5 h-3.5 text-brand-400" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-medium text-white">{flight.airline}</p>
            <p className="text-xs text-surface-500">{flight.flightNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">
            {formatPrice(flight.price, flight.currency)}
          </p>
          {flight.trendEmoji && flight.previousFare && (
            <p className="text-xs text-surface-500">
              {flight.trendEmoji} antes {formatPrice(flight.previousFare, flight.currency)}
            </p>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-center">
          <p className="text-xl font-bold text-white">{origin}</p>
          <p className="text-xs text-surface-500 truncate max-w-[80px]">
            {flight.originAirport || 'Origen'}
          </p>
          <p className="text-xs font-medium text-surface-300 mt-1">
            {formatFlightTime(flight.departureTime)}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 w-full">
            <div className="flex-1 h-px bg-surface-700" />
            <Plane className="w-3.5 h-3.5 text-brand-500 rotate-90" strokeWidth={2} />
            <div className="flex-1 h-px bg-surface-700" />
          </div>
          <div className="flex items-center gap-1 text-xs text-surface-500">
            <Clock className="w-3 h-3" />
            {formatDuration(flight.durationMinutes)}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xl font-bold text-white">{destination}</p>
          <p className="text-xs text-surface-500 truncate max-w-[80px]">
            {flight.destinationAirport || 'Destino'}
          </p>
          <p className="text-xs font-medium text-surface-300 mt-1">
            {formatFlightTime(flight.arrivalTime)}
          </p>
        </div>
      </div>

      {/* Footer badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={flight.nonstop ? 'green' : 'default'}>
          {flight.nonstop ? 'Directo' : `${flight.stops} escala${flight.stops > 1 ? 's' : ''}`}
        </Badge>
        {flight.cabinClass && (
          <Badge variant="default">
            {flight.cabinClass === 'economy' ? 'Turista' : flight.cabinClass}
          </Badge>
        )}
        {flight.recommendation && (
          <Badge variant={flight.fareDifference && flight.fareDifference < 0 ? 'green' : 'default'}>
            {flight.recommendation}
          </Badge>
        )}
      </div>
    </div>
  );
}
