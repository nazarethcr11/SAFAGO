import { DESTINATION_DB } from '@/lib/destinationDB';
import type { Destination } from '@/types';

// ── Region-based fallback images ─────────────────────────────────────────────
// All IDs are taken directly from the curated DESTINATION_DB — guaranteed valid.
// Each entry is the representative destination image for that region.
const REGION_FALLBACKS: Record<string, string> = {
  asia:            'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', // Bali
  europe:          'https://images.unsplash.com/photo-1499856845952-5e13a7bea2a1?w=600&q=80', // París
  south_america:   'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80', // Machu Picchu
  caribbean:       'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&q=80', // Cancún
  central_america: 'https://images.unsplash.com/photo-1552521562-e9b432b1ee01?w=600&q=80',  // Costa Rica
  north_america:   'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=600&q=80', // Whistler
  africa:          'https://images.unsplash.com/photo-1489493512598-d08130f49bea?w=600&q=80', // Marrakech
  oceania:         'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80', // universal
};

export const UNIVERSAL_FALLBACK =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80';

/**
 * Returns a guaranteed-valid Unsplash imageUrl for the given destination.
 *
 * Resolution order:
 * 1. Look up DESTINATION_DB by IATA code (exact match)
 * 2. Look up DESTINATION_DB by name (case-insensitive)
 * 3. Region-based fallback (using a curated image for that region)
 * 4. Universal travel fallback
 *
 * This prevents GPT-4o-mini from hallucinating Unsplash photo IDs, since
 * the model is instructed to omit imageUrl and we resolve it server-side.
 */
export function resolveImageUrl(
  dest: Partial<Destination> & { region?: string }
): string {
  // 1. Match by IATA (most reliable)
  if (dest.iata) {
    const match = DESTINATION_DB.find((d) => d.iata === dest.iata);
    if (match?.imageUrl) return match.imageUrl;
  }

  // 2. Match by name (case-insensitive)
  if (dest.name) {
    const nameLower = dest.name.toLowerCase();
    const match = DESTINATION_DB.find(
      (d) => d.name.toLowerCase() === nameLower
    );
    if (match?.imageUrl) return match.imageUrl;
  }

  // 3. Region-based fallback
  if (dest.region) {
    const region = dest.region.toLowerCase().replace(/[\s-]/g, '_');
    const fallback = REGION_FALLBACKS[region];
    if (fallback) return fallback;
  }

  // 4. Universal fallback
  return UNIVERSAL_FALLBACK;
}
