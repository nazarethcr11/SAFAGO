import { Plane, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { Flight } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDuration } from '@/utils/formatters';
import { buildBookingUrl } from '@/lib/bookingUrls';

interface FlightCardProps {
  flight: Flight;
}

/** Extrae HH:MM de un string "YYYY-MM-DD HH:mm" o ISO */
function timeOnly(dateStr: string | undefined): string {
  if (!dateStr) return '--:--';
  const m = dateStr.match(/(\d{2}:\d{2})/);
  return m ? m[1] : '--:--';
}

export function FlightCard({ flight }: FlightCardProps) {
  const parts = flight.route.split('-');
  const originCode = parts[0];
  const destCode = parts[parts.length - 1];
  const bookingUrl = buildBookingUrl(flight);
  const hasSegments = (flight.segments?.length ?? 0) > 0;

  return (
    <div className="glass rounded-2xl border border-surface-700/50 hover:border-brand-700/60 transition-all duration-300 p-4 w-72 flex-shrink-0 flex flex-col gap-3">

      {/* ── Header: logo + aerolínea + precio ─────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {flight.airlineLogo ? (
            <img
              src={flight.airlineLogo}
              alt={flight.airline}
              className="w-7 h-7 rounded-md object-contain bg-white p-0.5"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-surface-700 flex items-center justify-center">
              <Plane className="w-3.5 h-3.5 text-brand-400" strokeWidth={2} />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-white leading-tight">{flight.airline}</p>
            <p className="text-xs text-surface-500">{flight.flightNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-white">{formatPrice(flight.price, flight.currency)}</p>
          <p className="text-xs text-surface-500">por persona</p>
        </div>
      </div>

      {/* ── Ruta principal: IATA salida → IATA llegada ─────────────────── */}
      <div className="flex items-center gap-2">
        {/* Origen */}
        <div className="text-center min-w-[48px]">
          <p className="text-xl font-bold text-white">{originCode}</p>
          <p className="text-xs font-semibold text-surface-300">{timeOnly(flight.departureTime)}</p>
        </div>

        {/* Línea central */}
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1 w-full">
            <div className="flex-1 h-px bg-surface-600" />
            {!flight.nonstop && (
              <div className="flex gap-0.5 mx-0.5">
                {Array.from({ length: flight.stops }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                ))}
              </div>
            )}
            <Plane className="w-3.5 h-3.5 text-brand-500 rotate-90" strokeWidth={2} />
            <div className="flex-1 h-px bg-surface-600" />
          </div>
          <div className="flex items-center gap-1 text-xs text-surface-500">
            <Clock className="w-3 h-3" />
            {formatDuration(flight.durationMinutes)}
          </div>
        </div>

        {/* Destino */}
        <div className="text-center min-w-[48px]">
          <p className="text-xl font-bold text-white">{destCode}</p>
          <p className="text-xs font-semibold text-surface-300">{timeOnly(flight.arrivalTime)}</p>
        </div>
      </div>

      {/* ── Detalle de segmentos (solo vuelos con escalas) ─────────────── */}
      {!flight.nonstop && hasSegments && (
        <div className="border border-surface-700/60 rounded-xl p-2.5 space-y-2 bg-surface-800/40">
          {flight.segments!.map((seg, idx) => (
            <div key={idx}>
              {/* Segmento */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {seg.airlineLogo && (
                    <img
                      src={seg.airlineLogo}
                      alt={seg.airline}
                      className="w-4 h-4 object-contain bg-white rounded p-px"
                    />
                  )}
                  <span className="text-xs font-medium text-surface-300">{seg.flightNumber}</span>
                </div>
                {seg.airplane && (
                  <span className="text-xs text-surface-500">{seg.airplane}</span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold text-white w-9 text-center">{seg.departureAirport}</span>
                <span className="text-surface-400">{timeOnly(seg.departureTime)}</span>
                <div className="flex-1 h-px bg-surface-600 mx-1" />
                <span className="text-surface-500">{formatDuration(seg.durationMinutes)}</span>
                <div className="flex-1 h-px bg-surface-600 mx-1" />
                <span className="text-surface-400">{timeOnly(seg.arrivalTime)}</span>
                <span className="font-bold text-white w-9 text-center">{seg.arrivalAirport}</span>
              </div>

              {/* Escala entre segmentos */}
              {idx < flight.segments!.length - 1 && flight.layovers?.[idx] && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-400/90 bg-amber-900/20 rounded-lg px-2 py-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>
                    Escala en {flight.layovers[idx].airport}
                    {' — '}{formatDuration(flight.layovers[idx].durationMinutes)}
                    {flight.layovers[idx].overnight ? ' · nocturna' : ''}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Badges ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={flight.nonstop ? 'green' : 'default'}>
          {flight.nonstop ? 'Directo' : `${flight.stops} escala${flight.stops > 1 ? 's' : ''}`}
        </Badge>
        {flight.cabinClass && (
          <Badge variant="default">
            {flight.cabinClass.toLowerCase() === 'economy' ? 'Turista' : flight.cabinClass}
          </Badge>
        )}
        {flight.returnDate && <Badge variant="default">Ida y vuelta</Badge>}
      </div>

      {/* ── CTA — precio verificado en Google Flights ─────────────────── */}
      <a
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-xs font-semibold transition-colors duration-200"
      >
        Ver en Google Flights
        <ExternalLink className="w-3 h-3" strokeWidth={2.5} />
      </a>
    </div>
  );
}
