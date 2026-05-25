/**
 * Conversational state machine for SAFAGO — Phase 3.
 * Uses hard constraints (region, climate, budget, mainActivity) + soft preferences
 * to ensure region-aware, season-smart recommendations.
 *
 * Stages: discovery → refinement → destination_selection → date_selection → flight_search
 */

import {
  ConversationState,
  ConversationPreferences,
  Destination,
  ChatResponse,
} from '@/types';
import { getTopDestinations, DestinationEntry, DESTINATION_DB } from '@/lib/destinationDB';
import { MOCK_FLIGHTS } from '@/utils/constants';

// ── Destination name aliases (for specific-destination detection) ─────────────
// Maps destination IDs → list of lowercase keywords that identify them.
const DEST_ALIASES: Record<string, string[]> = {
  'asia-bali':  ['bali'],
  'asia-bkk':   ['bangkok', 'tailandia', 'thailand'],
  'asia-krabi': ['krabi', 'phuket'],
  'asia-vnm':   ['vietnam', 'hoi an', 'hanoi', 'hanói', 'ha long'],
  'asia-lka':   ['sri lanka'],
  'asia-jpn':   ['japon', 'japón', 'japan', 'tokio', 'tokyo', 'kioto', 'kyoto', 'osaka'],
  'asia-npl':   ['nepal', 'katmandu', 'everest', 'himalaya'],
  'asia-sgp':   ['singapur', 'singapore'],
  'asia-mdv':   ['maldivas', 'maldives'],
  'asia-plw':   ['palawan', 'el nido'],
  'asia-khm':   ['angkor', 'siem reap', 'camboya'],
  'eur-cdg':    ['paris', 'parís'],
  'eur-mad':    ['madrid'],
  'eur-bcn':    ['barcelona'],
  'eur-rom':    ['roma', 'rome', 'vaticano'],
  'eur-snt':    ['santorini'],
  'eur-lis':    ['lisboa', 'lisbon'],
  'eur-ams':    ['amsterdam', 'ámsterdam'],
  'eur-prg':    ['praga', 'prague'],
  'eur-isl':    ['islandia', 'iceland'],
  'ski-brc':    ['bariloche'],
  'ski-scl':    ['valle nevado'],
  'ski-sma':    ['san martin', 'chapelco'],
  'ski-yvr':    ['whistler'],
  'sam-cuz':    ['cusco', 'machu picchu', 'cuzco'],
  'sam-eze':    ['buenos aires'],
  'sam-mde':    ['medellin', 'medellín'],
  'sam-pat':    ['torres del paine'],
  'sam-gal':    ['galápagos', 'galapagos'],
  'sam-rio':    ['rio de janeiro', 'río de janeiro'],
  'car-cun':    ['cancun', 'cancún'],
  'car-tul':    ['tulum'],
  'car-ctg':    ['cartagena'],
  'car-puj':    ['punta cana'],
  'cam-cri':    ['costa rica'],
  'afr-mrk':    ['marrakech', 'marrakesh'],
  'afr-tza':    ['serengeti', 'zanzibar', 'zanzíbar', 'tanzania'],
};

/** Deep, zone-specific questions to ask when a specific destination is identified. */
const DESTINATION_DEEP_QUESTIONS: Record<string, string> = {
  'asia-bali': `¡Bali suena increíble! 🌺 Tiene zonas muy distintas, ¿cuál de estas vibes te llama más?\n\n🌿 **Ubud** — templos, arrozales en terrazas, yoga y retiros\n🏄 **Canggu** — surf, cafés cool y ambiente digital nomad\n🏔️ **Uluwatu** — acantilados espectaculares, templos al borde del mar\n💆 **Seminyak / Nusa Dua** — beach clubs, resorts 5★ y relax total\n\n¿Y en qué mes piensas viajar?`,

  'asia-jpn': `¡Japón es de otro nivel! 🗾 Cada zona es un mundo diferente:\n\n🌸 **Kioto** — templos milenarios, geishas y tradición pura\n⚡ **Tokio** — tecnología, anime, Shibuya y street food infinito\n🍜 **Osaka** — la capital gastronómica de Asia\n⛷️ **Hokkaido** — naturaleza, onsen volcánicos y ski en invierno\n\n¿Qué te atrae más? ¿Y en qué época del año?`,

  'asia-vnm': `¡Vietnam es de los destinos más ricos de Asia! 🏮\n\n🏛️ **Hanói** — capital histórica, callejones coloniales y pho auténtico\n🌊 **Ha Long Bay** — miles de islas de piedra caliza emergiendo del mar\n🏮 **Hoi An** — pueblo de linternas, playas y gastronomía única\n🌆 **Ciudad Ho Chi Minh** — energía pura, historia y street food\n\n¿Cuántos días tendrías? La ruta norte-sur es la clásica`,

  'asia-lka': `¡Sri Lanka es una joya todavía no masificada! 🌿\n\n🐘 **Safari en Udawalawe** — elefantes en libertad a pocos metros\n🚂 **Tren Kandy-Ella** — uno de los viajes en tren más fotogénicos del mundo\n🏖️ **Playas del sur** (Unawatuna, Mirissa) — ideales en diciembre-abril\n🏛️ **Sigiriya** — fortaleza en roca a 200 metros de altura\n\n¿Qué te llama más: safari, playa, cultura... o todo?`,

  'asia-mdv': `¡Las Maldivas son el paraíso absoluto! 🏝️\n\n¿Qué tipo de experiencia imaginas?\n🛖 **Bungalow sobre el agua** — lo más icónico de Maldivas\n🤿 **Buceo y snorkel** — uno de los mejores arrecifes del mundo\n💑 **Luna de miel / aniversario** — sunset cruises, cenas en la playa\n🧘 **Spa y bienestar total** — desconexión absoluta\n\n¿Cuántas noches tienes en mente?`,

  'eur-cdg': `¡París siempre es buena idea! 🗼 ¿Qué tipo de viaje imaginas?\n\n🎨 **Arte y museos** — Louvre, Orsay, Pompidou (reserva con anticipación)\n🍷 **Gastronomía** — bistrós, mercados, pastelerías y vino\n💑 **Romántico** — Montmartre, cenas con vista a la Eiffel, el Sena\n🛍️ **Moda y compras** — Le Marais, Champs-Élysées, Saint-Germain\n📸 **Fotografía** — callejones, la Eiffel al amanecer, Versalles\n\n¿Viajas solo/a o en compañía?`,

  'eur-bcn': `¡Barcelona lo tiene todo! 🏖️ Ciudad, playa y cultura en uno:\n\n🏛️ **Gaudí y arquitectura** — Sagrada Família, Park Güell (icónico)\n🌊 **Playa** — Barceloneta y calas más tranquilas al norte\n🍕 **Gastronomía** — La Boqueria, tapas, pintxos y vino catalán\n🎉 **Nightlife** — una de las mejores vidas nocturnas de Europa\n\n¿Tienes mes aproximado en mente?`,

  'eur-rom': `¡Roma, la Ciudad Eterna! 🏛️ Nunca falla:\n\n🏟️ **Historia antigua** — Coliseo, Foro Romano, Palatino\n⛪ **El Vaticano** — Capilla Sixtina y Basílica de San Pedro\n🍝 **Gastronomía** — pasta, pizza y gelato en su tierra natal\n💧 **Paseos icónicos** — Fontana di Trevi, Piazza Navona\n\n¿Es tu primera vez en Roma? ¿Cuántos días tienes?`,

  'eur-snt': `¡Santorini es de ensueño! 🌅\n\n¿Qué buscas más en Santorini?\n🌸 **Oia al atardecer** — el más fotografiado del mundo\n🏊 **Playas volcánicas** — arena roja, negra y blanca, todas únicas\n🍷 **Vinos volcánicos** — catas con vista a la caldera\n💑 **Romántico** — perfecto para luna de miel o aniversario\n\n¿Viajas en pareja? ¿Y en qué mes?`,

  'eur-lis': `¡Lisboa es encantadora y todavía asequible! 🚋\n\n¿Qué te llama más?\n🚃 **Tranvías históricos** — el mítico 28 por los barrios con colinas\n🎵 **Fado y cultura** — música melancólica en tascas auténticas\n🏖️ **Playas cercanas** — Cascais y Sintra a 40 min en tren\n🍷 **Gastronomía** — pastéis de nata, bacalhau y vino verde\n\n¿Cuántos días tienes?`,

  'ski-brc': `¡Bariloche es increíble! ⛷️ ¿Qué buscas más en el viaje?\n\n🎿 **Ski puro** — Cerro Catedral, 120 km de pistas (julio-agosto)\n🌊 **Lagos y naturaleza** — navegación y trekking patagónico\n🍫 **Gastronomía** — el mejor chocolate y fondue de Argentina\n💑 **Romántico** — cabaña con vista al lago Nahuel Huapi\n\n¿En qué mes piensas ir?`,

  'ski-yvr': `¡Whistler es el ski más épico del continente! 🏔️\n\n¿Qué tipo de experiencia buscas?\n🎿 **Ski y snowboard** — 200+ pistas, el mayor resort de Norteamérica\n🍺 **Après-ski** — bares al pie de pistas con música en vivo\n🏘️ **Whistler Village** — boutiques, restaurantes y ambiente cosmopolita\n🦅 **Aventura en verano** — mountain biking y zip-lining (junio-sept)\n\n¿En qué mes viajas?`,

  'sam-cuz': `¡Cusco y Machu Picchu son una experiencia transformadora! 🏛️\n\n¿Qué es lo más importante para ti?\n🥾 **Camino Inca** (4 días de trek — reserva con meses de anticipación)\n🚆 **Tren turístico** (cómodo, llega a Aguas Calientes en ~3h)\n🏔️ **Valle Sagrado** — Pisac, Ollantaytambo, salinas de Maras\n🌆 **Cusco ciudad** — mercados, gastronomía andina, Qorikancha\n\n¿Cuántos días tienes aproximadamente?`,

  'sam-eze': `¡Buenos Aires es la París de Sudamérica! 🥩\n\n¿Qué te llama más?\n🥩 **Gastronomía** — asado, empanadas y la mejor carne del mundo\n💃 **Tango** — milongas auténticas en San Telmo y La Boca\n🎨 **Arte y cultura** — MALBA, Palermo, galerías y graffiti\n🌃 **Nightlife** — BA no para antes de las 4am\n\n¿En qué mes viajas y cuántos días tienes?`,

  'sam-rio': `¡Río de Janeiro tiene una energía única! 🏖️\n\n¿Qué te imaginas haciendo ahí?\n🏖️ **Ipanema y Copacabana** — las playas más famosas del mundo\n🌿 **Cristo Redentor** — la vista desde el cerro es impresionante\n🎵 **Samba y cultura** — Santa Teresa, La Lapa, carnaval fuera de temporada\n🎉 **Nightlife** — Lapa es legendario por sus bares de samba\n\n¿En qué mes viajas?`,

  'car-cun': `¡Cancún tiene mil caras! 🌊 ¿Qué tipo de experiencia buscas?\n\n🏨 **Todo incluido** — resorts con playa privada y comida ilimitada\n🏛️ **Cultura y arqueología** — Chichén Itzá (2h), Tulum ruins (1h30)\n🤿 **Buceo y cenotes** — el sistema subterráneo más grande del mundo\n🎉 **Vida nocturna** — zona hotelera con clubs de primer nivel\n\n¿Viajas solo/a, en pareja o en grupo?`,

  'car-tul': `¡Tulum tiene un vibe único! 🏺 ¿Qué imaginas haciendo ahí?\n\n🏖️ **Playa y relax** — las playas más bonitas del Caribe mexicano\n💧 **Cenotes** — Dos Ojos, Gran Cenote (experiencias bajo tierra únicas)\n🧘 **Wellness y yoga** — retiros, meditación y ambiente boho-chic\n🏺 **Ruinas mayas** — sobre el mar Caribe (impresionante)\n\n¿Cuántos días tienes y en qué época del año?`,

  'car-ctg': `¡Cartagena es una joya caribeña! 🏰 ¿Qué buscas más?\n\n🏰 **Ciudad amurallada** — calles coloniales declaradas Patrimonio UNESCO\n🏝️ **Islas del Rosario** — snorkel en aguas cristalinas a 45 min en lancha\n🍲 **Gastronomía** — la mejor cocina caribeña de Colombia\n🌃 **Vida nocturna** — barrios Getsemaní y el Centro Histórico\n\n¿En qué mes viajas?`,

  'afr-mrk': `¡Marrakech es otro mundo! 🕌 ¿Qué te llama más?\n\n🌀 **La Médina** — zocos laberínticos, especias y artesanía\n🐪 **El Sahara** — desierto a 6h, noches bajo las estrellas\n🌹 **Riad y descanso** — jardines interiores, hamam y relax total\n🍲 **Gastronomía** — tajines, mint tea y mercados nocturnos\n\n¿Cuántos días tienes? ¿Es para semana completa o escapada?`,

  'afr-tza': `¡Tanzania es la experiencia de vida salvaje más épica del mundo! 🦁\n\n¿Qué combinación te interesa más?\n🦁 **Safari puro** — Serengeti, Ngorongoro, la Gran Migración (junio-oct)\n🏖️ **Safari + Zanzíbar** — la combinación perfecta (bush + beach)\n🏔️ **Kilimanjaro** — el techo de África (requiere preparación)\n📸 **Safari fotográfico** — amanecer en la sabana\n\n¿Cuántos días tienes en mente?`,
};

// ── Keyword maps ─────────────────────────────────────────────────────────────

const KW = {
  // REGION signals
  region: {
    asia: [
      'asia', 'asiático', 'asiatico', 'bali', 'tailandia', 'thailand', 'vietnam',
      'japon', 'japón', 'india', 'china', 'indonesia', 'sri lanka', 'nepal',
      'singapur', 'singapore', 'filipinas', 'maldivas', 'camboya', 'cambodia',
      'bangkok', 'tokio', 'kyoto', 'seúl', 'corea', 'hong kong', 'tibet',
      'krabi', 'phuket', 'palawan', 'angkor', 'siem reap',
    ],
    europe: [
      'europa', 'europeo', 'europea', 'españa', 'italia', 'francia', 'alemania',
      'grecia', 'portugal', 'holanda', 'amsterdam', 'paris', 'paris', 'roma',
      'barcelona', 'madrid', 'praga', 'london', 'londres', 'viena', 'zurich',
      'santorini', 'islandia', 'escandinavia', 'noruega', 'suecia', 'suiza',
      'lisboa', 'lisbon', 'berlin', 'berlín', 'amsterdam',
    ],
    south_america: [
      'sudamerica', 'sudamérica', 'america del sur', 'latinoamerica',
      'patagonia', 'peru', 'perú', 'argentina', 'chile', 'colombia', 'brasil',
      'ecuador', 'bolivia', 'uruguay', 'venezuela', 'machu picchu', 'cusco',
      'bariloche', 'buenos aires', 'medellín', 'medellin', 'bogotá', 'bogota',
      'torres del paine', 'galápagos', 'galapagos', 'rio', 'río de janeiro',
    ],
    caribbean: [
      'caribe', 'caribeño', 'cancun', 'cancún', 'punta cana', 'cuba', 'jamaica',
      'tulum', 'playa del carmen', 'isla mujeres', 'bahamas', 'aruba',
      'república dominicana', 'puerto rico', 'barbados', 'trinidad',
    ],
    central_america: [
      'centroamerica', 'centroamérica', 'costa rica', 'panama', 'panamá',
      'guatemala', 'belize', 'belice', 'honduras', 'nicaragua', 'el salvador',
    ],
    north_america: [
      'norteamerica', 'estados unidos', 'usa', 'canada', 'canadá',
      'nueva york', 'new york', 'miami', 'vancouver', 'whistler', 'chicago',
      'los angeles', 'san francisco', 'alaska', 'montreal', 'toronto',
    ],
    africa: [
      'africa', 'áfrica', 'marruecos', 'morocco', 'egipto', 'kenia', 'kenya',
      'tanzania', 'sudáfrica', 'sudafrica', 'safari', 'serengeti', 'zanzibar',
      'marrakech', 'cairo', 'sahara',
    ],
    oceania: [
      'australia', 'nueva zelanda', 'new zealand', 'oceania', 'oceanía',
      'sydney', 'melbourne', 'fiji', 'tahití', 'tahiti', 'polinesia',
    ],
  },

  // CLIMATE signals
  climate: {
    warm: [
      'calor', 'caluroso', 'tropical', 'calido', 'cálido', 'sol', 'verano',
      'clima cálido', 'clima calido', 'caliente', 'playa tropical', 'caribe',
      'clima tropical', 'buen tiempo', 'temperatura alta', 'warmth',
    ],
    cold: [
      'frio', 'frío', 'nieve', 'fresco', 'invierno', 'helado', 'congelado',
      'temperaturas bajas', 'polar', 'subártico', 'subarctico', 'glaciar',
      'nevado', 'alta montaña', 'ski', 'esqui', 'esquiar', 'snowboard',
    ],
    temperate: [
      'templado', 'primavera', 'otoño', 'suave', 'agradable', 'ni frio ni calor',
      'clima templado', 'temperatura agradable', 'fresco pero no frio',
    ],
  },

  // MAIN ACTIVITY signals
  activity: {
    skiing: ['esqui', 'esquiar', 'ski', 'snowboard', 'pistas', 'nieve y ski', 'cerro nevado', 'resort de ski'],
    beach: ['playa', 'arena', 'tomar sol', 'sol y playa', 'playa tropical', 'costa', 'litoral'],
    diving: ['bucear', 'buceo', 'snorkel', 'snorkeling', 'arrecife', 'coral', 'submarinismo', 'vida marina'],
    trekking: ['trekking', 'senderismo', 'hiking', 'hike', 'caminar por montaña', 'senderos', 'caminata', 'treking', 'trail'],
    city: ['visitar ciudades', 'ciudad', 'urbano', 'capitales'],
    wildlife: ['fauna', 'animales salvajes', 'safari', 'avistamiento de', 'wildlife', 'vida salvaje', 'tortugas', 'elefantes', 'leones'],
    culture: ['cultura', 'historia', 'museos', 'patrimonio', 'arqueolog', 'arte', 'templos', 'ruinas', 'castillos'],
    wellness: ['yoga', 'spa', 'meditación', 'meditacion', 'bienestar', 'retiro', 'descanso total', 'wellness'],
    adventure: ['aventura', 'adrenalina', 'escalada', 'rafting', 'parapente', 'extremo', 'bungee', 'tirolesa'],
  },

  // TRAVEL STYLE signals
  style: {
    active: ['activo', 'activa', 'actividad', 'deportivo', 'deportiva', 'movido', 'movida', 'dinámico', 'dinamico'],
    relax: ['relax', 'relajar', 'descansar', 'descanso', 'tranquilo', 'tranquila', 'desconectar', 'sin prisa'],
    party: ['fiesta', 'bares', 'discotecas', 'nightlife', 'vida nocturna', 'salir de noche', 'juerga'],
    romantic: ['luna de miel', 'romántico', 'romantico', 'aniversario', 'pareja', 'íntimo', 'intimo'],
    family: ['familia', 'con mis hijos', 'con hijos', 'niños', 'infantil'],
    solo: ['solo', 'sola', 'mochilero', 'mochilera', 'viajero solitario'],
  },

  // LUXURY LEVEL signals
  luxury: {
    budget: ['economico', 'económico', 'barato', 'asequible', 'low cost', 'presupuesto bajo', 'lo más barato'],
    midrange: ['precio razonable', 'calidad precio', 'sin gastar demasiado', 'moderado'],
    premium: ['lujo', 'lujoso', 'premium', 'exclusivo', '5 estrellas', 'high-end', 'lo mejor', 'sin límite'],
  },

  // NATURE interest signal (soft — goes to interestTags unless paired with active/trekking)
  nature: ['naturaleza', 'nature', 'paisaje', 'bosque', 'montaña', 'verde', 'flora', 'selva'],

  months: {
    enero: '01', febrero: '02', marzo: '03', abril: '04',
    mayo: '05', junio: '06', julio: '07', agosto: '08',
    septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
  },

  origins: {
    lima: 'LIM', bogota: 'BOG', bogotá: 'BOG', santiago: 'SCL',
    'buenos aires': 'EZE', quito: 'UIO', medellin: 'MDE', medellín: 'MDE',
    caracas: 'CCS', miami: 'MIA', madrid: 'MAD', barcelona: 'BCN',
    'ciudad de mexico': 'MEX', 'ciudad de méxico': 'MEX', guayaquil: 'GYE',
    asuncion: 'ASU', asunción: 'ASU', montevideo: 'MVD', 'la paz': 'LPB',
    'sao paulo': 'GRU', 'río de janeiro': 'GIG', 'rio de janeiro': 'GIG',
  },

  confirmations: [
    'si', 'sí', 'exacto', 'perfecto', 'me interesa', 'me quedo con', 'vamos a',
    'ese destino', 'esa opción', 'esa opcion', 'ese', 'genial', 'ok', 'dale', 'va',
    'suena bien', 'me gusta', 'me convence', 'quiero ir a', 'me llama',
  ],
};

function has(lower: string, terms: string[]): boolean {
  return terms.some((t) => lower.includes(t));
}

// ── Detection interfaces ──────────────────────────────────────────────────────

interface Detected {
  region: string | null;
  climate: string | null;
  mainActivity: string | null;
  travelStyle: string | null;
  luxuryLevel: string | null;
  interestTags: string[];
  budget: number | null;
  travelers: number | null;
  month: string | null;
  tripDuration: string | null;
  originCity: string | null;
  originIata: string | null;
  departureDate: string | null;
  returnDate: string | null;
  specificDestination: DestinationEntry | null;  // Level-3: exact destination named
  mentionedDestination: Destination | null;       // Level-2: named from current shortlist
  isConfirmation: boolean;
  isRejection: boolean;
}

export function detectFromMessage(message: string, shortlisted: Destination[]): Detected {
  const lower = message.toLowerCase();

  // ── Region ──────────────────────────────────────────────────────────────
  let region: string | null = null;
  for (const [reg, terms] of Object.entries(KW.region)) {
    if (has(lower, terms)) { region = reg; break; }
  }

  // ── Climate ─────────────────────────────────────────────────────────────
  let climate: string | null = null;
  if (has(lower, KW.climate.warm)) climate = 'warm';
  else if (has(lower, KW.climate.cold)) climate = 'cold';
  else if (has(lower, KW.climate.temperate)) climate = 'temperate';

  // ── Main Activity ───────────────────────────────────────────────────────
  let mainActivity: string | null = null;
  // Priority order matters — skiing beats beach when "nieve" is present
  if (has(lower, KW.activity.skiing)) mainActivity = 'skiing';
  else if (has(lower, KW.activity.diving)) mainActivity = 'diving';
  else if (has(lower, KW.activity.wildlife)) mainActivity = 'wildlife';
  else if (has(lower, KW.activity.wellness)) mainActivity = 'wellness';
  else if (has(lower, KW.activity.trekking)) mainActivity = 'trekking';
  else if (has(lower, KW.activity.adventure)) mainActivity = 'adventure';
  else if (has(lower, KW.activity.culture)) mainActivity = 'culture';
  else if (has(lower, KW.activity.beach)) mainActivity = 'beach';
  else if (has(lower, KW.activity.city)) mainActivity = 'city';
  // "naturaleza + activa" → trekking
  else if (has(lower, KW.nature) && (has(lower, KW.style.active) || lower.includes('activ'))) {
    mainActivity = 'trekking';
  }

  // ── Travel Style ─────────────────────────────────────────────────────────
  let travelStyle: string | null = null;
  if (has(lower, KW.style.romantic)) travelStyle = 'romantic';
  else if (has(lower, KW.style.family)) travelStyle = 'family';
  else if (has(lower, KW.style.party)) travelStyle = 'party';
  else if (has(lower, KW.style.active)) travelStyle = 'active';
  else if (has(lower, KW.style.relax)) travelStyle = 'relax';
  else if (has(lower, KW.style.solo)) travelStyle = 'solo';

  // ── Luxury Level ─────────────────────────────────────────────────────────
  let luxuryLevel: string | null = null;
  if (has(lower, KW.luxury.premium)) luxuryLevel = 'premium';
  else if (has(lower, KW.luxury.budget)) luxuryLevel = 'budget';
  else if (has(lower, KW.luxury.midrange)) luxuryLevel = 'midrange';

  // ── Interest Tags ─────────────────────────────────────────────────────────
  const interestTags: string[] = [];
  if (has(lower, KW.nature)) interestTags.push('naturaleza');
  if (lower.includes('gastronomia') || lower.includes('gastronomía') || lower.includes('comer')) interestTags.push('gastronomia');
  if (lower.includes('fotografía') || lower.includes('fotografia') || lower.includes('fotos')) interestTags.push('fotografía');
  if (lower.includes('surf')) interestTags.push('surf');
  if (lower.includes('yoga')) interestTags.push('yoga');
  if (lower.includes('arte')) interestTags.push('arte');
  if (lower.includes('historia')) interestTags.push('historia');
  if (lower.includes('arquitectura')) interestTags.push('arquitectura');

  // ── Budget ────────────────────────────────────────────────────────────────
  let budget: number | null = null;
  const budgetMatch = lower.match(/\$\s*(\d{2,5})|(\d{2,5})\s*(?:usd|dólar|dollar|dolares?)/i);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1] || budgetMatch[2], 10);
  } else if (has(lower, KW.luxury.premium)) {
    budget = 2500;
  } else if (has(lower, KW.luxury.budget)) {
    budget = 600;
  }

  // ── Travelers ─────────────────────────────────────────────────────────────
  let travelers: number | null = null;
  if (/\bsolo\b|\bsola\b/.test(lower)) travelers = 1;
  else if (/pareja|esposa|esposo|novia|novio|para dos|nosotros dos/.test(lower)) travelers = 2;
  else if (/familia|con mis hijos|con hijos/.test(lower)) travelers = 4;
  else {
    const tm = lower.match(/(\d+)\s*(?:personas?|viajeros?|adultos?|pasajeros?)/);
    if (tm) travelers = parseInt(tm[1], 10);
  }

  // ── Month ─────────────────────────────────────────────────────────────────
  let month: string | null = null;
  for (const [name, num] of Object.entries(KW.months)) {
    if (lower.includes(name)) { month = `2026-${num}`; break; }
  }

  // ── Trip Duration ─────────────────────────────────────────────────────────
  let tripDuration: string | null = null;
  if (/fin de semana|weekend/.test(lower)) tripDuration = 'weekend';
  else if (/2 semanas|dos semanas/.test(lower)) tripDuration = 'twoweeks';
  else if (/un mes|1 mes/.test(lower)) tripDuration = 'month';
  else if (/semana|1 semana|7 días|7 dias/.test(lower)) tripDuration = 'week';

  // ── Origin City ───────────────────────────────────────────────────────────
  let originCity: string | null = null;
  let originIata: string | null = null;
  for (const [city, iata] of Object.entries(KW.origins)) {
    if (lower.includes(city)) {
      originCity = city.charAt(0).toUpperCase() + city.slice(1);
      originIata = iata;
      break;
    }
  }

  // ── Dates ─────────────────────────────────────────────────────────────────
  let departureDate: string | null = null;
  let returnDate: string | null = null;

  const rangePattern = /del?\s+(\d{1,2})\s+al?\s+(\d{1,2})\s+(?:de\s+)?(\w+)/i;
  const rangeMatch = lower.match(rangePattern);
  if (rangeMatch) {
    const monthNum = KW.months[rangeMatch[3] as keyof typeof KW.months];
    if (monthNum) {
      departureDate = `2026-${monthNum}-${rangeMatch[1].padStart(2, '0')}`;
      returnDate = `2026-${monthNum}-${rangeMatch[2].padStart(2, '0')}`;
    }
  }
  if (!departureDate) {
    const singlePattern = /(?:el\s+)?(\d{1,2})\s+(?:de\s+)?(\w+)/i;
    const singleMatch = lower.match(singlePattern);
    if (singleMatch) {
      const monthNum = KW.months[singleMatch[2] as keyof typeof KW.months];
      if (monthNum) departureDate = `2026-${monthNum}-${singleMatch[1].padStart(2, '0')}`;
    }
  }

  // ── Specific destination detection (Level-3 specificity) ─────────────────
  // Check whether the user named a specific destination from the DB.
  let specificDestination: DestinationEntry | null = null;
  outer: for (const [destId, aliases] of Object.entries(DEST_ALIASES)) {
    for (const alias of aliases) {
      const matched = alias.includes(' ')
        ? lower.includes(alias)                                    // multi-word: substring
        : new RegExp(`\\b${alias}\\b`, 'i').test(lower);          // single word: boundary
      if (matched) {
        specificDestination = DESTINATION_DB.find((d) => d.id === destId) ?? null;
        if (specificDestination) break outer;
      }
    }
  }

  // ── Mentioned destination from shortlist ──────────────────────────────────
  let mentionedDestination: Destination | null = null;
  for (const dest of shortlisted) {
    if (lower.includes(dest.name.toLowerCase().split(' ')[0])) {
      mentionedDestination = dest;
      break;
    }
  }

  const isConfirmation = has(lower, KW.confirmations) && shortlisted.length > 0;
  const isRejection = has(lower, [
    'no me gusta', 'no me convence', 'descarta', 'otra opcion', 'otra opción',
    'cambiar destino', 'no me interesa', 'otro destino',
  ]);

  return {
    region, climate, mainActivity, travelStyle, luxuryLevel, interestTags,
    budget, travelers, month, tripDuration, originCity, originIata,
    departureDate, returnDate, specificDestination, mentionedDestination,
    isConfirmation, isRejection,
  };
}

// ── Preference merging ────────────────────────────────────────────────────────
// Hard constraints: keep existing value if already set (no silent override).
// Soft preferences: merge/accumulate.

export function mergePreferences(
  existing: ConversationPreferences,
  detected: Detected
): ConversationPreferences {
  return {
    // HARD — set first time, persist. Explicit new value overrides.
    region: detected.region ?? existing.region,
    climate: detected.climate ?? existing.climate,
    budget: detected.budget ?? existing.budget,
    mainActivity: detected.mainActivity ?? existing.mainActivity,
    // SOFT — accumulate
    travelStyle: detected.travelStyle ?? existing.travelStyle,
    luxuryLevel: detected.luxuryLevel ?? existing.luxuryLevel,
    interestTags: [...new Set([...existing.interestTags, ...detected.interestTags])],
    // LOGISTICS
    travelers: detected.travelers ?? existing.travelers,
    month: detected.month ?? existing.month,
    tripDuration: detected.tripDuration ?? existing.tripDuration,
    originCity: detected.originCity ?? existing.originCity,
    originIata: detected.originIata ?? existing.originIata,
  };
}

// ── Stage transition helpers ──────────────────────────────────────────────────

function hasEnoughForRefinement(prefs: ConversationPreferences, turnCount: number): boolean {
  const hasRegion = prefs.region !== null;
  const hasClimate = prefs.climate !== null;
  const hasActivity = prefs.mainActivity !== null;

  // Rich signal in first message → go immediately
  if (hasRegion && hasClimate && hasActivity) return true;
  // Skiing always narrows enough with just 1 extra qualifier
  if (hasActivity && prefs.mainActivity === 'skiing' && turnCount >= 1) return true;
  // Region + one qualifier after ≥2 turns
  if (turnCount >= 2 && hasRegion && (hasClimate || hasActivity)) return true;
  // Activity + climate without region after ≥2 turns
  if (turnCount >= 2 && hasActivity && hasClimate) return true;
  // Force after 5 turns
  if (turnCount >= 5) return true;
  return false;
}

function hasEnoughForFlightSearch(state: ConversationState): boolean {
  return !!(
    state.confirmedDestination &&
    state.preferences.originCity &&
    (state.departureDate || state.preferences.month)
  );
}

// ── Discovery question builder ────────────────────────────────────────────────

function buildDiscoveryQuestion(prefs: ConversationPreferences, turnCount: number): string {
  const { region, climate, mainActivity, travelStyle, luxuryLevel, month } = prefs;

  // Skiing path — shortened discovery
  if (mainActivity === 'skiing') {
    if (!luxuryLevel && !prefs.budget) {
      return `¡Excelente elección! Para el ski perfecto, ¿qué tipo de experiencia buscas? ⛷️\n\n🏔️ **Naturaleza + montaña** (Bariloche, San Martín — más auténtico)\n🎿 **Resort premium** (Whistler — pistas de clase mundial)\n💸 **Relación calidad-precio** (Valle Nevado — cercano a Lima)\n\n¿Y tienes mes en mente?`;
    }
    if (!prefs.originCity) {
      return `Perfecto, ya tengo lo que necesito 🎿 ¿Desde qué ciudad sale tu vuelo?`;
    }
  }

  // Ask in priority: region → climate → activity → style → details
  if (!region && turnCount >= 1) {
    return `¿Qué parte del mundo te llama más la atención? 🌍\n\n🌏 **Asia** (Bali, Japón, Vietnam, Sri Lanka)\n🌍 **Europa** (España, Italia, Grecia, Portugal)\n🌎 **Latinoamérica** (Patagonia, Colombia, Perú)\n🏝️ **Caribe** (México, Rep. Dominicana, Cuba)\n🌍 **África o Medio Oriente** (Marruecos, Tanzania)`;
  }

  if (!climate && !mainActivity) {
    if (region) {
      return `¿Qué tipo de experiencia buscas en ${regionLabel(region)}? 🎯\n\n☀️ **Playa y calor**\n🥾 **Trekking y naturaleza activa**\n🏛️ **Cultura e historia**\n🤿 **Buceo y vida marina**\n🧘 **Bienestar y relax**`;
    }
    return `¿Qué clima prefieres?\n☀️ **Calor tropical** (playa, sol, clima cálido)\n🏔️ **Frío / nieve** (ski, montaña)\n🌤️ **Templado** (primavera, agradable todo el año)`;
  }

  if (!mainActivity && climate) {
    return `¿Cuál sería la actividad principal del viaje? 🎯\n\n🏖️ Playa y relax\n🥾 Trekking y senderismo\n🏛️ Cultura e historia\n🤿 Buceo y vida marina\n🦁 Safari y wildlife\n🧘 Bienestar y yoga`;
  }

  if (!travelStyle && !luxuryLevel) {
    const actLabel = mainActivity ? activityLabel(mainActivity) : 'viaje';
    return `Para afinar la selección de ${actLabel}: ¿cómo describes tu estilo de viaje?\n\n🏃 **Activo y aventurero**\n😴 **Relax total, sin apuro**\n💑 **Romántico en pareja**\n🎉 **Social y con vida nocturna**\n\n¿Y con qué presupuesto aproximado cuentas por persona?`;
  }

  if (!month) {
    return `¿En qué mes piensas viajar? Esto me ayuda a recomendarte la mejor temporada 📅`;
  }

  return `¿Hay algo más que te importe del viaje? Por ejemplo: cuántas personas viajan, presupuesto máximo, o si prefieres algo específico como gastronomía o fotografía 🌍`;
}

function regionLabel(region: string): string {
  const map: Record<string, string> = {
    asia: 'Asia', europe: 'Europa', south_america: 'Sudamérica',
    caribbean: 'el Caribe', central_america: 'Centroamérica',
    north_america: 'Norteamérica', africa: 'África', oceania: 'Oceanía',
  };
  return map[region] ?? region;
}

function activityLabel(activity: string): string {
  const map: Record<string, string> = {
    skiing: 'ski ⛷️', beach: 'playa 🏖️', diving: 'buceo 🤿',
    trekking: 'trekking 🥾', city: 'ciudad 🏙️', wildlife: 'safari 🦁',
    culture: 'cultura 🏛️', wellness: 'bienestar 🧘', adventure: 'aventura 🏔️',
  };
  return map[activity] ?? activity;
}

// ── Research content builder ──────────────────────────────────────────────────

function buildResearchContent(dest: Destination, prefs: ConversationPreferences): string {
  const monthNames: Record<string, string> = {
    '01': 'enero', '02': 'febrero', '03': 'marzo', '04': 'abril',
    '05': 'mayo', '06': 'junio', '07': 'julio', '08': 'agosto',
    '09': 'septiembre', '10': 'octubre', '11': 'noviembre', '12': 'diciembre',
  };
  const monthLabel = prefs.month ? monthNames[prefs.month.split('-')[1]] : null;

  const researchMap: Record<string, string> = {
    'ski-brc': `⛷️ Cerro Catedral — 120 km de pistas, el mayor resort de Sudamérica\n❄️ Mejor nieve: **del 5 al 25 de agosto**\n🌡️ Temperaturas de -5°C a 8°C — lleva ropa en capas\n💡 *Tip:* Los precios de vuelo bajan después del 20 de agosto`,
    'ski-scl': `⛷️ Valle Nevado queda a 60 km de Santiago — fácil de combinar\n❄️ Nieve garantizada en julio-agosto, hasta 5m de acumulación\n🍷 Vino chileno de bajada incluido en el ambiente\n💡 *Tip:* Vuelo Lima→Santiago puede ser muy económico`,
    'ski-sma': `🏔️ Chapelco ski resort entre bosques nativos y lagos patagónicos\n❄️ Menos masificado que Bariloche — pistas para todos los niveles\n🦌 Avistamiento de fauna patagónica al pie de pistas\n💡 *Tip:* La opción más tranquila y auténtica de los Andes argentinos`,
    'ski-yvr': `⛷️ 8.171 acres esquiables — el mayor resort de América del Norte\n❄️ La mejor nieve "powder" del continente, garantizada de noviembre a marzo\n🍺 Après-ski legendario con bares con música en vivo al pie de pistas\n💡 *Tip:* Requiere escala; reserva con meses de anticipación`,
    'asia-bali': `🌺 Mejor época: ${monthLabel === 'junio' || monthLabel === 'julio' || monthLabel === 'agosto' ? '¡Perfecto! Junio-agosto es la temporada más seca de Bali' : 'Evita enero-marzo (temporada de lluvias)'}\n🏄 Surf en Kuta, templos en Ubud, yoga en Canggu — todo en la misma isla\n🍜 Gastronomía increíble con opciones desde $5 hasta $100\n💡 *Tip:* Ubud es ideal para wellness; Seminyak para lujo y nightlife`,
    'asia-bkk': `🏙️ Bangkok en diciembre-febrero: seco y fresco — la mejor temporada\n🍛 Street food de nivel Michelin a $2-5 en los mercados nocturnos\n⛩️ El Gran Palacio y Wat Pho te tomarán todo el día (y vale la pena)\n💡 *Tip:* Tuk-tuk para corta distancia; metro (BTS) para cruzar la ciudad`,
    'asia-vnm': `🏮 Hoi An en febrero-abril: clima ideal, ciudad menos congestionada\n🛵 El paso Hai Van es uno de los paisajes más espectaculares de Asia\n🍜 Pho, Banh Mi, Cao Lau — cada región tiene su plato icónico\n💡 *Tip:* Viajar de norte a sur (Hanói → Hoi An → Ciudad Ho Chi Minh) es la ruta clásica`,
    'asia-lka': `🐘 Udawalawe es mejor para elefantes; Yala para leopardos\n🚂 El tren Kandy-Ella es uno de los más fotogénicos del mundo\n🏖️ Unawatuna y Mirissa (sur) están perfectas en diciembre-abril\n💡 *Tip:* País compacto — en 10 días ves cultura, safari Y playa`,
    'asia-jpn': `🌸 Marzo-abril (sakura) y septiembre-noviembre (koyo) son las épocas ideales\n🍣 El país con más restaurantes con estrellas Michelin per cápita del mundo\n🚄 El shinkansen (tren bala) conecta Tokio-Kioto en 2h15\n💡 *Tip:* Compra el JR Pass internacional antes de viajar`,
    'asia-npl': `🏔️ Octubre-noviembre: cielo despejado, vistas al Everest garantizadas\n🥾 El trek Everest Base Camp tarda 14 días; Annapurna Circuit, 10 días\n🙏 Katmandú tiene 7 sitios UNESCO en una sola ciudad\n💡 *Tip:* Aclimatarse 2-3 días en Katmandú antes del trek`,
    'eur-cdg': `🗼 París en ${monthLabel ?? 'esta época'}: ${monthLabel === 'julio' || monthLabel === 'agosto' ? 'caluroso pero mágico; muchos parisinos de vacaciones' : 'encantador y menos congestionado que en verano'}\n🎨 El Louvre requiere reserva con anticipación; el Orsay es más íntimo\n🥐 Desayuno en bistró local = la experiencia más auténtica\n💡 *Tip:* Versalles vale el viaje de día; ve de martes a jueves (menos cola)`,
    'eur-mad': `🍺 Tapas en el Mercado de San Miguel y La Latina — plan obligatorio\n🎨 El Triángulo del Arte: El Prado + Thyssen + Reina Sofía\n🌙 Madrid no duerme: cenas a las 10pm, bares hasta las 5am\n💡 *Tip:* Vuelo directo Lima→Madrid con Iberia o Air Europa`,
    'eur-snt': `🌅 El atardecer de Oia es uno de los más fotografiados del mundo\n🍷 Los vinos volcánicos Assyrtiko son únicos en el planeta\n🏊 Playas de arena roja (Akrotiri), negra (Perissa) y blanca (Vlychada)\n💡 *Tip:* Mayo o septiembre son los mejores meses — menos calor y menos turistas`,
    'sam-cuz': `🏛️ Machu Picchu, el Camino Inca y el Valle Sagrado en un viaje\n🌄 ${monthLabel === 'agosto' || monthLabel === 'julio' ? '¡Perfecto! Julio-agosto es temporada seca en Cusco — el mejor mes' : 'Evita enero-marzo (temporada de lluvias)'}\n🍽️ La gastronomía peruana es reconocida como la mejor de Latinoamérica\n💡 *Tip:* Aclimatarse 1 día completo antes de subir a Machu Picchu (3.400 msnm)`,
    'sam-gal': `🐢 Las tortugas gigantes de la isla Santa Cruz son únicas en el mundo\n🤿 El mejor buceo del Pacífico — tiburones martillo en Wolf y Darwin\n📸 Los animales no tienen miedo a los humanos — las fotos son increíbles\n💡 *Tip:* Enero-marzo: aguas cálidas para snorkel; junio-septiembre: mejor para buceo`,
    'sam-pat': `⛰️ El W Trek (4 días) es el más popular; el O Trek (9 días) es más completo\n🐾 Los pumas son avistados regularmente en octubre-noviembre\n🧊 El Grey Glacier y los glaciares del Cerro Torre son de otro mundo\n💡 *Tip:* Noviembre-diciembre: días larguísimos y clima más estable`,
    'car-cun': `🌊 Zona Hotelera vs Centro: uno para resort, otro para cultura\n🏛️ Chichén Itzá (2h), Tulum ruins (1h30), Cenotes (1h) — todas excursiones de día\n☀️ Diciembre-mayo: temporada seca y clima perfecto\n💡 *Tip:* Las aerolineas Low Cost hacen esta ruta muy económica`,
    'car-tul': `🏺 Ruinas mayas sobre el Mar Caribe — las más fotogénicas de México\n💧 Los cenotes como Dos Ojos o Gran Cenote son experiencias únicas\n🌿 Ambiente boho-chic: glamping, retiros de yoga y restaurantes orgánicos\n💡 *Tip:* Noviembre-abril es la mejor temporada; alquila bicicleta para moverte`,
    'afr-mrk': `🕌 La Médina de Marrakech es un laberinto declarado Patrimonio UNESCO\n🐪 El desierto del Sahara queda a 6h en coche — experiencia imperdible\n🌹 Los riads con jardín interior son la opción de alojamiento local\n💡 *Tip:* Marzo-mayo y septiembre-noviembre son los mejores meses (sin calor extremo)`,
    'afr-tza': `🦁 La Gran Migración ocurre junio-octubre en el Serengeti — impresionante\n🏖️ Zanzíbar: playas con agua turquesa a 20°C todo el año\n📸 Tanzania tiene los Big Five más fotografiados de África Oriental\n💡 *Tip:* Combinar Serengeti + Zanzíbar es la experiencia definitiva de África`,
  };

  const research = researchMap[dest.id] ??
    `📍 **${dest.name}** es una experiencia única que pocos viajeros olvidan\n🌦️ ${monthLabel ? `En ${monthLabel}` : 'Esta temporada'} es un buen momento para visitar\n💡 *Tip:* Reserva con al menos 3-4 semanas de anticipación para mejores precios`;

  return `¡Excelente elección! **${dest.name} (${dest.country})** es perfecta para lo que buscas 🎉\n\n**Lo que debes saber:**\n${research}\n\n¿Desde qué ciudad sale tu vuelo y tienes fechas tentativas?`;
}

// ── Flight response builder (used in multiple stages) ────────────────────────

function buildFlightResponse(
  dest: Destination,
  prefs: ConversationPreferences,
  departureDate: string | null,
  returnDate: string | null,
  newState: ConversationState
): { response: ChatResponse; newState: ConversationState } {
  const origin = prefs.originCity ?? 'tu ciudad';
  const dateLabel = departureDate
    ? `del **${departureDate}**${returnDate ? ` al **${returnDate}**` : ''}`
    : prefs.month
      ? `en **${prefs.month}**`
      : '';

  const flights = MOCK_FLIGHTS.filter((f) =>
    f.route.startsWith(prefs.originIata ?? 'LIM')
  );

  return {
    response: {
      type: 'flights',
      content: `✈️ Encontré las mejores opciones de **${origin}** a **${dest.name}** ${dateLabel}:`,
      flights: flights.length > 0 ? flights : MOCK_FLIGHTS.slice(0, 3),
      conversationState: newState,
    },
    newState,
  };
}

// ── Main processing function ──────────────────────────────────────────────────

export function processConversation(
  message: string,
  state: ConversationState
): { response: ChatResponse; newState: ConversationState } {
  const detected = detectFromMessage(message, state.shortlistedDestinations);
  const newPrefs = mergePreferences(state.preferences, detected);
  const newTurn = state.turnCount + 1;

  let newState: ConversationState = {
    ...state,
    preferences: newPrefs,
    turnCount: newTurn,
  };

  // ─ FLIGHT SEARCH (re-query in same session) ──────────────────────────────
  if (state.stage === 'flight_search') {
    const dest = state.confirmedDestination!;
    return buildFlightResponse(
      dest, newPrefs,
      state.departureDate, state.returnDate,
      newState
    );
  }

  // ─ DATE SELECTION ────────────────────────────────────────────────────────
  if (state.stage === 'date_selection') {
    if (detected.departureDate || detected.originCity) {
      newState = {
        ...newState,
        departureDate: detected.departureDate ?? state.departureDate,
        returnDate:    detected.returnDate    ?? state.returnDate,
        preferences:   newPrefs,
      };

      if (hasEnoughForFlightSearch(newState)) {
        newState = { ...newState, stage: 'flight_search' };
        return buildFlightResponse(
          state.confirmedDestination!, newPrefs,
          newState.departureDate, newState.returnDate,
          newState
        );
      }

      const missingOrigin = !newPrefs.originCity;
      const missingDate   = !newState.departureDate && !newPrefs.month;

      if (missingOrigin && missingDate) {
        return {
          response: {
            type: 'text',
            content: `Para buscar los vuelos necesito dos cosas:\n\n🛫 **¿Desde qué ciudad sale tu vuelo?**\n📅 **¿En qué fechas? (ej: del 10 al 20 de agosto)**`,
            conversationState: newState,
          },
          newState,
        };
      }
      if (missingOrigin) {
        return {
          response: {
            type: 'text',
            content: `¡Casi listo! Solo me falta saber: **¿desde qué ciudad sale tu vuelo?** 🛫`,
            conversationState: newState,
          },
          newState,
        };
      }
      if (missingDate) {
        return {
          response: {
            type: 'text',
            content: `¡Perfecto, ya sé que sales de **${newPrefs.originCity}**! ¿Tienes fechas en mente? (ej: "del 10 al 20 de agosto") 📅`,
            conversationState: newState,
          },
          newState,
        };
      }
    }

    return {
      response: {
        type: 'text',
        content: `Para buscar tus vuelos necesito: **¿desde qué ciudad sales?** y **¿en qué fechas?** (ej: "Lima, del 10 al 20 de agosto") 🗓️`,
        conversationState: newState,
      },
      newState,
    };
  }

  // ─ DESTINATION SELECTION ────────────────────────────────────────────────
  if (state.stage === 'destination_selection') {
    const confirmedDest = state.confirmedDestination!;

    if (detected.originCity || detected.departureDate) {
      newState = {
        ...newState,
        departureDate: detected.departureDate ?? state.departureDate,
        returnDate:    detected.returnDate    ?? state.returnDate,
        preferences:   newPrefs,
      };

      if (hasEnoughForFlightSearch(newState)) {
        newState = { ...newState, stage: 'flight_search' };
        return buildFlightResponse(
          confirmedDest, newPrefs,
          newState.departureDate, newState.returnDate,
          newState
        );
      }

      newState = { ...newState, stage: 'date_selection' };
    } else {
      newState = { ...newState, stage: 'date_selection' };
    }

    return {
      response: {
        type: 'text',
        content: buildResearchContent(confirmedDest, newPrefs),
        conversationState: newState,
      },
      newState,
    };
  }

  // ─ REFINEMENT ────────────────────────────────────────────────────────────
  if (state.stage === 'refinement') {
    // Specific destination named → deep-dive question
    if (detected.specificDestination && !state.confirmedDestination) {
      const dest = detected.specificDestination;
      newState = {
        ...newState,
        stage: 'destination_selection',
        confirmedDestination: dest,
        shortlistedDestinations: [dest],
      };
      const deepQ = DESTINATION_DEEP_QUESTIONS[dest.id];
      return {
        response: {
          type: 'text',
          content: deepQ ?? buildResearchContent(dest, newPrefs),
          conversationState: newState,
        },
        newState,
      };
    }

    let targetDest: Destination | null = detected.mentionedDestination;
    if (!targetDest && detected.isConfirmation && state.shortlistedDestinations.length > 0) {
      targetDest = state.shortlistedDestinations[0];
    }

    if (targetDest) {
      newState = {
        ...newState,
        stage: 'destination_selection',
        confirmedDestination: targetDest,
        shortlistedDestinations: [targetDest],
      };
      const deepQ = DESTINATION_DEEP_QUESTIONS[targetDest.id];
      return {
        response: {
          type: 'text',
          content: deepQ ?? buildResearchContent(targetDest, newPrefs),
          conversationState: newState,
        },
        newState,
      };
    }

    if (detected.isRejection || detected.region || detected.climate || detected.mainActivity) {
      const fresh = getTopDestinations(newPrefs, 4) as Destination[];
      newState = { ...newState, shortlistedDestinations: fresh };
      return {
        response: {
          type: 'destinations',
          content: `Actualicé las recomendaciones con tus preferencias 🎯 ¿Cuál te llama más la atención?`,
          recommendations: fresh,
          conversationState: newState,
        },
        newState,
      };
    }

    return {
      response: {
        type: 'destinations',
        content: `¿Alguna de estas opciones te llama más la atención? Cuéntame cuál y te doy todos los detalles 🗺️`,
        recommendations: state.shortlistedDestinations,
        conversationState: newState,
      },
      newState,
    };
  }

  // ─ DISCOVERY (default) ────────────────────────────────────────────────────

  // ── Level-3 specificity: user named a concrete destination ────────────────
  // Skip ALL region/climate discovery — go straight to deep destination questions.
  if (detected.specificDestination && !state.confirmedDestination) {
    const dest = detected.specificDestination;
    newState = {
      ...newState,
      stage: 'destination_selection',
      confirmedDestination: dest,
      shortlistedDestinations: [dest],
      // Auto-set region and region-implied climate from the destination
      preferences: {
        ...newPrefs,
        region: newPrefs.region ?? dest.region,
      },
    };
    const deepQ = DESTINATION_DEEP_QUESTIONS[dest.id];
    return {
      response: {
        type: 'text',
        content: deepQ ?? buildResearchContent(dest, newPrefs),
        conversationState: newState,
      },
      newState,
    };
  }

  // ── Level-2 / Level-1: shortlist mention or generic discovery ────────────
  if (detected.mentionedDestination) {
    const dest = detected.mentionedDestination;
    newState = {
      ...newState,
      stage: 'destination_selection',
      confirmedDestination: dest,
      shortlistedDestinations: [dest],
    };
    const deepQ = DESTINATION_DEEP_QUESTIONS[dest.id];
    return {
      response: {
        type: 'text',
        content: deepQ ?? buildResearchContent(dest, newPrefs),
        conversationState: newState,
      },
      newState,
    };
  }

  // Ready to show recommendations?
  if (hasEnoughForRefinement(newPrefs, newTurn)) {
    const destinations = getTopDestinations(newPrefs, 4) as Destination[];
    newState = { ...newState, stage: 'refinement', shortlistedDestinations: destinations };

    const constraintSummary = buildConstraintSummary(newPrefs);
    return {
      response: {
        type: 'destinations',
        content: `Basándome en ${constraintSummary}, estas son mis **top recomendaciones** para ti 🎯\n\n¿Cuál te llama más la atención? Puedo contarte todo sobre cualquiera o ajustar si buscas algo diferente.`,
        recommendations: destinations,
        conversationState: newState,
      },
      newState,
    };
  }

  // Still discovering — ask the next targeted question
  const content = buildDiscoveryQuestion(newPrefs, newTurn - 1);
  return {
    response: {
      type: 'text',
      content,
      conversationState: newState,
    },
    newState,
  };
}

function buildConstraintSummary(prefs: ConversationPreferences): string {
  const parts: string[] = [];
  if (prefs.region) parts.push(`tu interés en **${regionLabel(prefs.region)}**`);
  if (prefs.climate) {
    const cl = prefs.climate === 'warm' ? 'clima cálido' : prefs.climate === 'cold' ? 'clima frío' : 'clima templado';
    parts.push(cl);
  }
  if (prefs.mainActivity) parts.push(activityLabel(prefs.mainActivity));
  if (prefs.travelStyle) {
    const sl: Record<string, string> = { active: 'viaje activo', relax: 'relax', party: 'vida nocturna', romantic: 'viaje romántico', family: 'viaje familiar' };
    if (sl[prefs.travelStyle]) parts.push(sl[prefs.travelStyle]);
  }
  if (parts.length === 0) return 'tus preferencias';
  return parts.join(', ');
}

// ── Initial state factory ─────────────────────────────────────────────────────

export function createInitialState(): ConversationState {
  return {
    stage: 'discovery',
    preferences: {
      region: null,
      climate: null,
      budget: null,
      mainActivity: null,
      travelStyle: null,
      luxuryLevel: null,
      interestTags: [],
      travelers: 1,
      month: null,
      tripDuration: null,
      originCity: null,
      originIata: null,
    },
    shortlistedDestinations: [],
    rejectedDestinationIds: [],
    confirmedDestination: null,
    departureDate: null,
    returnDate: null,
    turnCount: 0,
  };
}
