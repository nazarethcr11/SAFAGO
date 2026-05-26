import { Destination } from '@/types';

export type RegionType =
  | 'asia'
  | 'europe'
  | 'south_america'
  | 'caribbean'
  | 'central_america'
  | 'north_america'
  | 'oceania'
  | 'africa';

export type ClimateType = 'tropical' | 'cold' | 'alpine' | 'temperate' | 'mediterranean' | 'desert' | 'subtropical';

export type MainActivity =
  | 'skiing'
  | 'beach'
  | 'diving'
  | 'trekking'
  | 'city'
  | 'wildlife'
  | 'culture'
  | 'wellness'
  | 'adventure';

export type TravelStyle = 'active' | 'relax' | 'party' | 'romantic' | 'family' | 'solo';
export type LuxuryLevel = 'budget' | 'midrange' | 'premium';

export interface DestinationEntry extends Destination {
  region: RegionType;
  climateType: ClimateType;
  mainActivities: MainActivity[];
  travelStyles: TravelStyle[];
  luxuryLevel: LuxuryLevel;
  interestTags: string[];
  bestMonths: number[];   // 1–12
  avoidMonths: number[];  // 1–12
}

// ── Climate compatibility map ────────────────────────────────────────────────
// prefs.climate ('warm' | 'cold' | 'temperate') → compatible ClimateTypes
export const CLIMATE_COMPAT: Record<string, ClimateType[]> = {
  warm: ['tropical', 'subtropical', 'mediterranean', 'desert'],
  cold: ['cold', 'alpine'],
  temperate: ['temperate', 'mediterranean', 'subtropical'],
};

// ── Destination database ─────────────────────────────────────────────────────

export const DESTINATION_DB: DestinationEntry[] = [
  // ── ASIA ──────────────────────────────────────────────────────────────────
  {
    id: 'asia-bali',
    iata: 'DPS',
    name: 'Bali',
    country: 'Indonesia',
    climate: 'Tropical',
    estimatedPrice: 950,
    currency: 'USD',
    tags: ['Playa', 'Templos', 'Bienestar', 'Naturaleza', 'Surfing'],
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
    description: 'La isla de los dioses. Templos milenarios, arrozales en terrazas, playas volcánicas y una cultura espiritual única en Asia.',
    rating: 4.9,
    region: 'asia',
    climateType: 'tropical',
    mainActivities: ['beach', 'wellness', 'trekking', 'diving', 'culture'],
    travelStyles: ['relax', 'romantic', 'active', 'solo'],
    luxuryLevel: 'midrange',
    interestTags: ['yoga', 'surf', 'fotografía', 'gastronomia', 'espiritualidad', 'naturaleza'],
    bestMonths: [4, 5, 6, 7, 8, 9],
    avoidMonths: [1, 2, 3],
  },
  {
    id: 'asia-bkk',
    iata: 'BKK',
    name: 'Bangkok',
    country: 'Tailandia',
    climate: 'Tropical húmedo',
    estimatedPrice: 900,
    currency: 'USD',
    tags: ['Ciudad', 'Templos', 'Gastronomía', 'Vida nocturna', 'Mercados'],
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80',
    description: 'La capital más vibrante de Asia. Templos dorados, mercados flotantes, gastronomía de clase mundial y una vida nocturna sin igual.',
    rating: 4.7,
    region: 'asia',
    climateType: 'tropical',
    mainActivities: ['city', 'culture', 'wellness'],
    travelStyles: ['active', 'party', 'solo', 'family'],
    luxuryLevel: 'budget',
    interestTags: ['gastronomia', 'fotografía', 'compras', 'nightlife', 'templos'],
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [5, 6, 7, 8, 9],
  },
  {
    id: 'asia-krabi',
    iata: 'KBV',
    name: 'Krabi',
    country: 'Tailandia',
    climate: 'Tropical',
    estimatedPrice: 870,
    currency: 'USD',
    tags: ['Playa', 'Kayak', 'Islas', 'Buceo', 'Acantilados'],
    imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80',
    description: 'Acantilados de piedra caliza sobre el mar de Andamán, playas de arena blanca y aguas cristalinas con arrecifes de coral.',
    rating: 4.8,
    region: 'asia',
    climateType: 'tropical',
    mainActivities: ['beach', 'diving', 'adventure', 'trekking'],
    travelStyles: ['active', 'romantic', 'relax'],
    luxuryLevel: 'budget',
    interestTags: ['surf', 'snorkel', 'kayak', 'naturaleza', 'islas'],
    bestMonths: [11, 12, 1, 2, 3, 4],
    avoidMonths: [5, 6, 7, 8, 9],
  },
  {
    id: 'asia-vnm',
    iata: 'HAN',
    name: 'Vietnam (Hoi An & Hanói)',
    country: 'Vietnam',
    climate: 'Subtropical húmedo',
    estimatedPrice: 850,
    currency: 'USD',
    tags: ['Cultura', 'Gastronomía', 'Naturaleza', 'Historia', 'Moto'],
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80',
    description: 'Pueblos de linterna, bahías de ensueño, gastronomía adictiva y montañas en el norte. Vietnam es uno de los destinos más ricos del mundo.',
    rating: 4.8,
    region: 'asia',
    climateType: 'subtropical',
    mainActivities: ['culture', 'trekking', 'beach', 'city'],
    travelStyles: ['active', 'solo', 'romantic'],
    luxuryLevel: 'budget',
    interestTags: ['gastronomia', 'fotografía', 'historia', 'naturaleza', 'moto'],
    bestMonths: [2, 3, 4, 10, 11],
    avoidMonths: [7, 8],
  },
  {
    id: 'asia-lka',
    iata: 'CMB',
    name: 'Sri Lanka',
    country: 'Sri Lanka',
    climate: 'Tropical',
    estimatedPrice: 1000,
    currency: 'USD',
    tags: ['Wildlife', 'Templos', 'Playa', 'Trekking', 'Té'],
    imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=80',
    description: 'La perla del Índico. Elefantes en libertad, trenes entre plantaciones de té, templos budistas y playas paradisíacas en una isla compacta.',
    rating: 4.8,
    region: 'asia',
    climateType: 'tropical',
    mainActivities: ['wildlife', 'trekking', 'culture', 'beach'],
    travelStyles: ['active', 'romantic', 'solo'],
    luxuryLevel: 'midrange',
    interestTags: ['safari', 'fotografía', 'naturaleza', 'historia', 'elefantes'],
    bestMonths: [12, 1, 2, 3, 4],
    avoidMonths: [5, 6],
  },
  {
    id: 'asia-jpn',
    iata: 'NRT',
    name: 'Japón (Tokio & Kioto)',
    country: 'Japón',
    climate: 'Templado',
    estimatedPrice: 1400,
    currency: 'USD',
    tags: ['Cultura', 'Gastronomía', 'Tecnología', 'Templos', 'Anime'],
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
    description: 'La dualidad perfecta: ultramodernidad en Tokio y serenidad feudal en Kioto. Gastronomía sublime, tecnología futurista y tradición milenaria.',
    rating: 5.0,
    region: 'asia',
    climateType: 'temperate',
    mainActivities: ['culture', 'city', 'wellness'],
    travelStyles: ['active', 'romantic', 'solo', 'family'],
    luxuryLevel: 'premium',
    interestTags: ['gastronomia', 'fotografía', 'anime', 'tecnología', 'arte', 'naturaleza'],
    bestMonths: [3, 4, 5, 9, 10, 11],
    avoidMonths: [],
  },
  {
    id: 'asia-npl',
    iata: 'KTM',
    name: 'Nepal (Katmandú & Himalaya)',
    country: 'Nepal',
    climate: 'Alpino de altitud',
    estimatedPrice: 1100,
    currency: 'USD',
    tags: ['Trekking', 'Himalaya', 'Espiritualidad', 'Aventura', 'Everest'],
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80',
    description: 'El techo del mundo. Trekking al pie del Everest, monasterios budistas en las nubes y una hospitalidad himalaya que te cambia la vida.',
    rating: 4.9,
    region: 'asia',
    climateType: 'alpine',
    mainActivities: ['trekking', 'adventure', 'culture', 'wildlife'],
    travelStyles: ['active', 'solo'],
    luxuryLevel: 'budget',
    interestTags: ['montaña', 'espiritualidad', 'fotografía', 'naturaleza', 'aventura extrema'],
    bestMonths: [3, 4, 5, 10, 11],
    avoidMonths: [6, 7, 8],
  },
  {
    id: 'asia-sgp',
    iata: 'SIN',
    name: 'Singapur',
    country: 'Singapur',
    climate: 'Tropical ecuatorial',
    estimatedPrice: 1300,
    currency: 'USD',
    tags: ['Ciudad', 'Gastronomía', 'Lujo', 'Shopping', 'Futurista'],
    imageUrl: 'https://images.unsplash.com/photo-1555217851-6141535bd771?w=600&q=80',
    description: 'La ciudad-estado del futuro. Gardens by the Bay, hawker centres con comida de Michelin a $3, y la mezcla cultural más sofisticada de Asia.',
    rating: 4.8,
    region: 'asia',
    climateType: 'tropical',
    mainActivities: ['city', 'culture', 'wellness'],
    travelStyles: ['family', 'romantic', 'solo'],
    luxuryLevel: 'premium',
    interestTags: ['gastronomia', 'compras', 'arquitectura', 'tecnología', 'fotografía'],
    bestMonths: [1, 2, 6, 7, 8],
    avoidMonths: [],
  },
  {
    id: 'asia-mdv',
    iata: 'MLE',
    name: 'Maldivas',
    country: 'Maldivas',
    climate: 'Tropical oceánico',
    estimatedPrice: 2200,
    currency: 'USD',
    tags: ['Lujo', 'Playa', 'Buceo', 'Bungalows sobre el agua', 'Luna de miel'],
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
    description: 'El paraíso absoluto. Bungalows sobre aguas turquesas, arrecifes de coral prístinos y atardeceres que no existen en otro lugar del planeta.',
    rating: 5.0,
    region: 'asia',
    climateType: 'tropical',
    mainActivities: ['beach', 'diving', 'wellness'],
    travelStyles: ['romantic', 'relax'],
    luxuryLevel: 'premium',
    interestTags: ['snorkel', 'buceo', 'lujo', 'fotografía', 'luna de miel'],
    bestMonths: [11, 12, 1, 2, 3, 4],
    avoidMonths: [5, 6, 7, 8, 9],
  },
  {
    id: 'asia-plw',
    iata: 'PPS',
    name: 'Palawan (El Nido)',
    country: 'Filipinas',
    climate: 'Tropical',
    estimatedPrice: 980,
    currency: 'USD',
    tags: ['Playa', 'Lagunas', 'Buceo', 'Islas', 'Naturaleza'],
    imageUrl: 'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=600&q=80',
    description: 'Clasificada repetidamente como la mejor isla del mundo. Lagunas escondidas, cuevas submarinas y biodiversidad marina extraordinaria.',
    rating: 4.9,
    region: 'asia',
    climateType: 'tropical',
    mainActivities: ['beach', 'diving', 'adventure', 'wildlife'],
    travelStyles: ['active', 'romantic', 'solo'],
    luxuryLevel: 'midrange',
    interestTags: ['snorkel', 'kayak', 'fotografía', 'naturaleza', 'islas'],
    bestMonths: [11, 12, 1, 2, 3, 4, 5],
    avoidMonths: [7, 8, 9, 10],
  },
  {
    id: 'asia-khm',
    iata: 'REP',
    name: 'Angkor Wat (Siem Reap)',
    country: 'Camboya',
    climate: 'Tropical monzónico',
    estimatedPrice: 820,
    currency: 'USD',
    tags: ['Historia', 'Templos', 'Cultura', 'Bicicleta', 'Económico'],
    imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80',
    description: 'El mayor complejo de templos del mundo. Angkor Wat al amanecer entre la jungla es una de las experiencias más impresionantes del planeta.',
    rating: 4.9,
    region: 'asia',
    climateType: 'tropical',
    mainActivities: ['culture', 'trekking', 'wildlife'],
    travelStyles: ['active', 'solo', 'romantic'],
    luxuryLevel: 'budget',
    interestTags: ['historia', 'fotografía', 'arqueología', 'naturaleza', 'bicicleta'],
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [5, 6, 7, 8, 9],
  },

  // ── EUROPE ────────────────────────────────────────────────────────────────
  {
    id: 'eur-cdg',
    iata: 'CDG',
    name: 'París',
    country: 'Francia',
    climate: 'Oceánico templado',
    estimatedPrice: 950,
    currency: 'USD',
    tags: ['Cultura', 'Arte', 'Romanticismo', 'Gastronomía', 'Moda'],
    imageUrl: 'https://images.unsplash.com/photo-1499856845952-5e13a7bea2a1?w=600&q=80',
    description: 'La ciudad del amor. Torre Eiffel, el Louvre, Montmartre y cafés que inspiran. Un clásico eterno que nunca decepciona.',
    rating: 4.7,
    region: 'europe',
    climateType: 'temperate',
    mainActivities: ['city', 'culture', 'wellness'],
    travelStyles: ['romantic', 'solo', 'family'],
    luxuryLevel: 'premium',
    interestTags: ['arte', 'moda', 'gastronomia', 'fotografía', 'arquitectura', 'romanticismo'],
    bestMonths: [4, 5, 6, 9, 10],
    avoidMonths: [],
  },
  {
    id: 'eur-mad',
    iata: 'MAD',
    name: 'Madrid',
    country: 'España',
    climate: 'Continental mediterráneo',
    estimatedPrice: 820,
    currency: 'USD',
    tags: ['Arte', 'Gastronomía', 'Historia', 'Museos', 'Nightlife'],
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80',
    description: 'El Prado, la Reina Sofía, tapas inigualables y una energía nocturna que no para. Europa al alcance de Latinoamérica.',
    rating: 4.8,
    region: 'europe',
    climateType: 'mediterranean',
    mainActivities: ['city', 'culture'],
    travelStyles: ['solo', 'party', 'romantic', 'family'],
    luxuryLevel: 'midrange',
    interestTags: ['arte', 'gastronomia', 'nightlife', 'historia', 'museos'],
    bestMonths: [4, 5, 6, 9, 10],
    avoidMonths: [7, 8],
  },
  {
    id: 'eur-bcn',
    iata: 'BCN',
    name: 'Barcelona',
    country: 'España',
    climate: 'Mediterráneo',
    estimatedPrice: 850,
    currency: 'USD',
    tags: ['Arquitectura', 'Playa', 'Gaudi', 'Gastronomía', 'Cultura'],
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    description: 'Gaudí, La Rambla, barrio Gótico y playas en el Mediterráneo. Barcelona combina arte, sol y gastronomía como ninguna otra ciudad.',
    rating: 4.8,
    region: 'europe',
    climateType: 'mediterranean',
    mainActivities: ['city', 'culture', 'beach'],
    travelStyles: ['party', 'romantic', 'solo', 'active'],
    luxuryLevel: 'midrange',
    interestTags: ['arquitectura', 'gaudi', 'gastronomia', 'nightlife', 'playa'],
    bestMonths: [4, 5, 6, 9, 10],
    avoidMonths: [7, 8],
  },
  {
    id: 'eur-rom',
    iata: 'FCO',
    name: 'Roma',
    country: 'Italia',
    climate: 'Mediterráneo',
    estimatedPrice: 870,
    currency: 'USD',
    tags: ['Historia', 'Arte', 'Gastronomía', 'Arqueología', 'Vaticano'],
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80',
    description: 'La Ciudad Eterna. El Coliseo, el Vaticano, la Fontana di Trevi y la mejor pasta del mundo. Historia viva a cada paso.',
    rating: 4.8,
    region: 'europe',
    climateType: 'mediterranean',
    mainActivities: ['culture', 'city'],
    travelStyles: ['romantic', 'family', 'solo'],
    luxuryLevel: 'midrange',
    interestTags: ['historia', 'arte', 'gastronomia', 'arqueología', 'fotografía'],
    bestMonths: [4, 5, 6, 9, 10],
    avoidMonths: [7, 8],
  },
  {
    id: 'eur-snt',
    iata: 'JTR',
    name: 'Santorini',
    country: 'Grecia',
    climate: 'Mediterráneo seco',
    estimatedPrice: 1100,
    currency: 'USD',
    tags: ['Romántico', 'Playa', 'Atardecer', 'Vino', 'Caldera'],
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80',
    description: 'Casas blancas sobre caldera volcánica, atardeceres legendarios en Oia y vinos volcánicos. La luna de miel perfecta.',
    rating: 4.9,
    region: 'europe',
    climateType: 'mediterranean',
    mainActivities: ['beach', 'culture', 'wellness'],
    travelStyles: ['romantic', 'relax'],
    luxuryLevel: 'premium',
    interestTags: ['romanticismo', 'fotografía', 'vino', 'gastronomia', 'lujo'],
    bestMonths: [5, 6, 7, 8, 9],
    avoidMonths: [11, 12, 1, 2],
  },
  {
    id: 'eur-lis',
    iata: 'LIS',
    name: 'Lisboa',
    country: 'Portugal',
    climate: 'Mediterráneo atlántico',
    estimatedPrice: 760,
    currency: 'USD',
    tags: ['Tram', 'Fado', 'Gastronomía', 'Surf', 'Pintoresco'],
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80',
    description: 'La Lisboa auténtica: tranvías históricos, Fado melancólico, pastéis de nata y las mejores playas de Europa a 40 km del centro.',
    rating: 4.7,
    region: 'europe',
    climateType: 'mediterranean',
    mainActivities: ['city', 'culture', 'beach'],
    travelStyles: ['solo', 'romantic', 'active'],
    luxuryLevel: 'budget',
    interestTags: ['gastronomia', 'surf', 'fotografía', 'historia', 'música'],
    bestMonths: [4, 5, 6, 9, 10],
    avoidMonths: [],
  },
  {
    id: 'eur-ams',
    iata: 'AMS',
    name: 'Ámsterdam',
    country: 'Países Bajos',
    climate: 'Templado oceánico',
    estimatedPrice: 880,
    currency: 'USD',
    tags: ['Canales', 'Museos', 'Bicicleta', 'Arte', 'Liberal'],
    imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80',
    description: 'Canales, tulipanes, Van Gogh y Rembrandt. Ámsterdam es una de las ciudades más habitables y culturalmente ricas de Europa.',
    rating: 4.6,
    region: 'europe',
    climateType: 'temperate',
    mainActivities: ['city', 'culture'],
    travelStyles: ['solo', 'romantic', 'active'],
    luxuryLevel: 'midrange',
    interestTags: ['arte', 'bicicleta', 'historia', 'canales', 'fotografía'],
    bestMonths: [4, 5, 6, 7, 8, 9],
    avoidMonths: [11, 12, 1, 2],
  },
  {
    id: 'eur-prg',
    iata: 'PRG',
    name: 'Praga',
    country: 'República Checa',
    climate: 'Templado continental',
    estimatedPrice: 700,
    currency: 'USD',
    tags: ['Medieval', 'Cerveza', 'Castillo', 'Historia', 'Económico'],
    imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&q=80',
    description: 'La ciudad de las 100 torres. Casco medieval intacto, la mejor cerveza del mundo y uno de los castillos más grandes de Europa.',
    rating: 4.7,
    region: 'europe',
    climateType: 'temperate',
    mainActivities: ['city', 'culture'],
    travelStyles: ['solo', 'romantic', 'party'],
    luxuryLevel: 'budget',
    interestTags: ['historia', 'arquitectura', 'gastronomia', 'fotografía', 'nightlife'],
    bestMonths: [5, 6, 7, 8, 9],
    avoidMonths: [12, 1, 2],
  },
  {
    id: 'eur-isl',
    iata: 'KEF',
    name: 'Islandia',
    country: 'Islandia',
    climate: 'Subártico',
    estimatedPrice: 1500,
    currency: 'USD',
    tags: ['Aurora boreal', 'Volcanes', 'Glaciares', 'Naturaleza', 'Aventura'],
    imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=80',
    description: 'El planeta en estado puro. Auroras boreales, géiseres, cascadas y volcanes activos en una isla que parece de otro mundo.',
    rating: 4.9,
    region: 'europe',
    climateType: 'cold',
    mainActivities: ['adventure', 'trekking', 'wildlife'],
    travelStyles: ['active', 'romantic', 'solo'],
    luxuryLevel: 'premium',
    interestTags: ['aurora', 'fotografía', 'naturaleza', 'aventura extrema', 'géisers'],
    bestMonths: [6, 7, 8],
    avoidMonths: [],
  },

  // ── SOUTH AMERICA ────────────────────────────────────────────────────────
  {
    id: 'ski-brc',
    iata: 'BRC',
    name: 'Bariloche',
    country: 'Argentina',
    climate: 'Frío andino',
    estimatedPrice: 520,
    currency: 'USD',
    tags: ['Ski', 'Naturaleza', 'Lagos', 'Económico', 'Patagonia'],
    imageUrl: 'https://images.unsplash.com/photo-1499244571948-7ccddb3583f1?w=600&q=80',
    description: 'El resort de ski más icónico de Sudamérica. Cerro Catedral ofrece 120 km de pistas con vistas al lago Nahuel Huapi.',
    rating: 4.8,
    region: 'south_america',
    climateType: 'alpine',
    mainActivities: ['skiing', 'trekking', 'adventure'],
    travelStyles: ['active', 'romantic', 'family'],
    luxuryLevel: 'midrange',
    interestTags: ['nieve', 'montaña', 'lagos', 'naturaleza', 'chocolate'],
    bestMonths: [7, 8, 9],
    avoidMonths: [12, 1, 2, 3],
  },
  {
    id: 'ski-scl',
    iata: 'SCL',
    name: 'Valle Nevado',
    country: 'Chile',
    climate: 'Alpino seco',
    estimatedPrice: 340,
    currency: 'USD',
    tags: ['Ski', 'Resort', 'Premium', 'Cercano Lima'],
    imageUrl: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80',
    description: 'Resort de ski premium a 60 km de Santiago. Nieve garantizada en julio y agosto con pistas para todos los niveles.',
    rating: 4.6,
    region: 'south_america',
    climateType: 'alpine',
    mainActivities: ['skiing'],
    travelStyles: ['active', 'family'],
    luxuryLevel: 'midrange',
    interestTags: ['nieve', 'ski', 'resort'],
    bestMonths: [7, 8],
    avoidMonths: [12, 1, 2, 3, 4, 5],
  },
  {
    id: 'ski-sma',
    iata: 'CPC',
    name: 'San Martín de los Andes',
    country: 'Argentina',
    climate: 'Frío andino patagónico',
    estimatedPrice: 490,
    currency: 'USD',
    tags: ['Ski', 'Naturaleza', 'Tranquilo', 'Bosque'],
    imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=80',
    description: 'Chapelco ski resort en un entorno de bosques y lagos. Mucho menos concurrido que Bariloche y más auténtico.',
    rating: 4.7,
    region: 'south_america',
    climateType: 'alpine',
    mainActivities: ['skiing', 'trekking'],
    travelStyles: ['active', 'romantic'],
    luxuryLevel: 'midrange',
    interestTags: ['nieve', 'bosque', 'naturaleza', 'tranquilidad'],
    bestMonths: [7, 8, 9],
    avoidMonths: [12, 1, 2],
  },
  {
    id: 'sam-cuz',
    iata: 'CUZ',
    name: 'Cusco & Machu Picchu',
    country: 'Perú',
    climate: 'Templado de altitud',
    estimatedPrice: 120,
    currency: 'USD',
    tags: ['Historia', 'Machu Picchu', 'Cultura', 'Trekking', 'Inca'],
    imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80',
    description: 'Puerta al Machu Picchu y capital del Imperio Inca. Arqueología, montañas sagradas y gastronomía andina sin igual.',
    rating: 4.9,
    region: 'south_america',
    climateType: 'temperate',
    mainActivities: ['culture', 'trekking', 'adventure'],
    travelStyles: ['active', 'solo', 'romantic'],
    luxuryLevel: 'budget',
    interestTags: ['historia', 'arqueología', 'montaña', 'fotografía', 'gastronomia'],
    bestMonths: [5, 6, 7, 8, 9],
    avoidMonths: [12, 1, 2, 3],
  },
  {
    id: 'sam-eze',
    iata: 'EZE',
    name: 'Buenos Aires',
    country: 'Argentina',
    climate: 'Templado húmedo',
    estimatedPrice: 380,
    currency: 'USD',
    tags: ['Ciudad', 'Gastronomía', 'Tango', 'Arte', 'Cultura'],
    imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600&q=80',
    description: 'La París de Sudamérica. Arquitectura europea, asados legendarios, milongas de tango y una escena cultural vibrante.',
    rating: 4.6,
    region: 'south_america',
    climateType: 'temperate',
    mainActivities: ['city', 'culture'],
    travelStyles: ['romantic', 'solo', 'party'],
    luxuryLevel: 'midrange',
    interestTags: ['gastronomia', 'tango', 'arte', 'nightlife', 'arquitectura'],
    bestMonths: [3, 4, 5, 9, 10, 11],
    avoidMonths: [6, 7, 8],
  },
  {
    id: 'sam-mde',
    iata: 'MDE',
    name: 'Medellín',
    country: 'Colombia',
    climate: 'Primaveral (eterna)',
    estimatedPrice: 270,
    currency: 'USD',
    tags: ['Ciudad', 'Innovación', 'Gastronomía', 'Naturaleza', 'Económico'],
    imageUrl: 'https://images.unsplash.com/photo-1598002652986-6a50b0dbb37b?w=600&q=80',
    description: 'La ciudad de la eterna primavera. De ser la más peligrosa a la más innovadora: hoy es un must para el viajero curioso.',
    rating: 4.7,
    region: 'south_america',
    climateType: 'subtropical',
    mainActivities: ['city', 'culture', 'trekking'],
    travelStyles: ['solo', 'active', 'party'],
    luxuryLevel: 'budget',
    interestTags: ['innovación', 'gastronomia', 'naturaleza', 'fotografía', 'nightlife'],
    bestMonths: [12, 1, 2, 3, 4, 7, 8],
    avoidMonths: [],
  },
  {
    id: 'sam-pat',
    iata: 'PUQ',
    name: 'Torres del Paine',
    country: 'Chile',
    climate: 'Subpolar oceánico',
    estimatedPrice: 580,
    currency: 'USD',
    tags: ['Trekking', 'Patagonia', 'Glaciares', 'Aventura', 'Wildlife'],
    imageUrl: 'https://images.unsplash.com/photo-1544964893-5f5af3d50c7c?w=600&q=80',
    description: 'El fin del mundo. Torres de granito, glaciares azules y pumas salvajes en uno de los parques más impresionantes del planeta.',
    rating: 4.9,
    region: 'south_america',
    climateType: 'cold',
    mainActivities: ['trekking', 'adventure', 'wildlife'],
    travelStyles: ['active', 'solo'],
    luxuryLevel: 'midrange',
    interestTags: ['montaña', 'glaciares', 'fotografía', 'aventura extrema', 'naturaleza'],
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [5, 6, 7, 8, 9],
  },
  {
    id: 'sam-gal',
    iata: 'GPS',
    name: 'Galápagos',
    country: 'Ecuador',
    climate: 'Subtropical oceánico',
    estimatedPrice: 650,
    currency: 'USD',
    tags: ['Wildlife', 'Naturaleza', 'Buceo', 'Único', 'Darwin'],
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80',
    description: 'El ecosistema más único del mundo. Convives con tortugas gigantes, leones marinos e iguanas que no conocen el miedo humano.',
    rating: 5.0,
    region: 'south_america',
    climateType: 'subtropical',
    mainActivities: ['wildlife', 'diving', 'adventure'],
    travelStyles: ['active', 'romantic', 'solo'],
    luxuryLevel: 'premium',
    interestTags: ['darwin', 'fotografía', 'snorkel', 'naturaleza', 'buceo'],
    bestMonths: [1, 2, 3, 12],
    avoidMonths: [],
  },
  {
    id: 'sam-rio',
    iata: 'GIG',
    name: 'Río de Janeiro',
    country: 'Brasil',
    climate: 'Tropical',
    estimatedPrice: 520,
    currency: 'USD',
    tags: ['Playa', 'Carnaval', 'Cristo Redentor', 'Samba', 'Vida nocturna'],
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80',
    description: 'La Cidade Maravilhosa. Ipanema, Copacabana, Cristo Redentor y la energía más contagiosa de Latinoamérica.',
    rating: 4.7,
    region: 'south_america',
    climateType: 'tropical',
    mainActivities: ['beach', 'city', 'culture'],
    travelStyles: ['party', 'active', 'romantic'],
    luxuryLevel: 'midrange',
    interestTags: ['playa', 'carnaval', 'fotografía', 'nightlife', 'samba'],
    bestMonths: [4, 5, 9, 10, 11],
    avoidMonths: [12, 1, 2, 3],
  },

  // ── CARIBBEAN / CENTRAL AMERICA ───────────────────────────────────────────
  {
    id: 'car-cun',
    iata: 'CUN',
    name: 'Cancún',
    country: 'México',
    climate: 'Tropical',
    estimatedPrice: 450,
    currency: 'USD',
    tags: ['Playa', 'Sol', 'Todo incluido', 'Vida nocturna', 'Caribe'],
    imageUrl: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&q=80',
    description: 'Aguas turquesas del Caribe, playas de arena blanca y vibrante zona hotelera. El clásico destino de playa de México.',
    rating: 4.7,
    region: 'caribbean',
    climateType: 'tropical',
    mainActivities: ['beach', 'diving'],
    travelStyles: ['party', 'family', 'relax'],
    luxuryLevel: 'midrange',
    interestTags: ['playa', 'resort', 'snorkel', 'nightlife', 'all-inclusive'],
    bestMonths: [12, 1, 2, 3, 4, 5],
    avoidMonths: [8, 9, 10],
  },
  {
    id: 'car-tul',
    iata: 'CUN',
    name: 'Tulum',
    country: 'México',
    climate: 'Tropical húmedo',
    estimatedPrice: 520,
    currency: 'USD',
    tags: ['Playa', 'Boho', 'Cenotes', 'Ruinas Mayas', 'Yoga'],
    imageUrl: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=600&q=80',
    description: 'Ruinas mayas sobre el Caribe, cenotes turquesa y un ambiente bohemio único. La alternativa eco-chic a Cancún.',
    rating: 4.6,
    region: 'caribbean',
    climateType: 'tropical',
    mainActivities: ['beach', 'wellness', 'culture', 'diving'],
    travelStyles: ['romantic', 'relax', 'solo'],
    luxuryLevel: 'midrange',
    interestTags: ['yoga', 'cenotes', 'fotografía', 'naturaleza', 'ruinas mayas'],
    bestMonths: [11, 12, 1, 2, 3, 4],
    avoidMonths: [8, 9, 10],
  },
  {
    id: 'car-ctg',
    iata: 'CTG',
    name: 'Cartagena',
    country: 'Colombia',
    climate: 'Tropical caribeño',
    estimatedPrice: 300,
    currency: 'USD',
    tags: ['Ciudad colonial', 'Playa', 'Historia', 'Caribe', 'Gastronomía'],
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80',
    description: 'Ciudad amurallada colonial con playas caribeñas cercanas en Islas del Rosario. Historia, gastronomía y playa en uno.',
    rating: 4.8,
    region: 'caribbean',
    climateType: 'tropical',
    mainActivities: ['culture', 'beach', 'city'],
    travelStyles: ['romantic', 'solo', 'family'],
    luxuryLevel: 'budget',
    interestTags: ['historia', 'arquitectura', 'gastronomia', 'fotografía', 'snorkel'],
    bestMonths: [12, 1, 2, 3, 4, 5],
    avoidMonths: [8, 9, 10],
  },
  {
    id: 'car-puj',
    iata: 'PUJ',
    name: 'Punta Cana',
    country: 'Rep. Dominicana',
    climate: 'Tropical',
    estimatedPrice: 380,
    currency: 'USD',
    tags: ['Playa', 'Todo incluido', 'Resort', 'Pareja', 'Familia'],
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
    description: 'Playas infinitas con arenas blancas y complejos todo incluido. Perfecto para desconectarse completamente.',
    rating: 4.5,
    region: 'caribbean',
    climateType: 'tropical',
    mainActivities: ['beach', 'wellness'],
    travelStyles: ['relax', 'romantic', 'family'],
    luxuryLevel: 'midrange',
    interestTags: ['resort', 'playa', 'all-inclusive', 'snorkel'],
    bestMonths: [12, 1, 2, 3, 4, 5],
    avoidMonths: [8, 9, 10],
  },
  {
    id: 'cam-cri',
    iata: 'SJO',
    name: 'Costa Rica',
    country: 'Costa Rica',
    climate: 'Tropical húmedo',
    estimatedPrice: 700,
    currency: 'USD',
    tags: ['Naturaleza', 'Volcanes', 'Surf', 'Tortugas', 'Eco-turismo'],
    imageUrl: 'https://images.unsplash.com/photo-1552521562-e9b432b1ee01?w=600&q=80',
    description: 'Pura vida. Volcanes activos, monos en la jungla, surf en Tamarindo y tortugas anidando en Tortuguero. Naturaleza en estado puro.',
    rating: 4.8,
    region: 'central_america',
    climateType: 'tropical',
    mainActivities: ['wildlife', 'adventure', 'trekking', 'beach'],
    travelStyles: ['active', 'family', 'romantic'],
    luxuryLevel: 'midrange',
    interestTags: ['naturaleza', 'surf', 'fotografía', 'eco-turismo', 'volcanes'],
    bestMonths: [12, 1, 2, 3, 4],
    avoidMonths: [9, 10],
  },

  // ── NORTH AMERICA ─────────────────────────────────────────────────────────
  {
    id: 'ski-yvr',
    iata: 'YVR',
    name: 'Whistler',
    country: 'Canadá',
    climate: 'Subalpino húmedo',
    estimatedPrice: 1200,
    currency: 'USD',
    tags: ['Ski', 'Premium', 'Après-ski', 'Mundial', 'Lujo'],
    imageUrl: 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=600&q=80',
    description: 'El resort de ski más grande de América del Norte. Experiencia de clase mundial con 200+ pistas y vida nocturna vibrante.',
    rating: 4.9,
    region: 'north_america',
    climateType: 'alpine',
    mainActivities: ['skiing', 'adventure'],
    travelStyles: ['active', 'party', 'romantic'],
    luxuryLevel: 'premium',
    interestTags: ['nieve', 'ski', 'après-ski', 'lujo', 'snowboard'],
    bestMonths: [12, 1, 2, 3],
    avoidMonths: [6, 7, 8, 9],
  },

  // ── AFRICA ────────────────────────────────────────────────────────────────
  {
    id: 'afr-mrk',
    iata: 'RAK',
    name: 'Marrakech',
    country: 'Marruecos',
    climate: 'Desértico semiárido',
    estimatedPrice: 750,
    currency: 'USD',
    tags: ['Médina', 'Especias', 'Zoco', 'Desierto', 'Gastronomía'],
    imageUrl: 'https://images.unsplash.com/photo-1489493512598-d08130f49bea?w=600&q=80',
    description: 'La ciudad roja. Médinas laberínticas, zocos coloridos, riads de lujo y el Sahara a pocas horas. África + Arabia en un destino.',
    rating: 4.7,
    region: 'africa',
    climateType: 'desert',
    mainActivities: ['culture', 'adventure', 'wellness'],
    travelStyles: ['romantic', 'solo', 'active'],
    luxuryLevel: 'midrange',
    interestTags: ['gastronomia', 'fotografía', 'desierto', 'arquitectura', 'compras'],
    bestMonths: [3, 4, 5, 9, 10, 11],
    avoidMonths: [6, 7, 8],
  },
  {
    id: 'afr-tza',
    iata: 'JRO',
    name: 'Tanzania (Serengeti + Zanzíbar)',
    country: 'Tanzania',
    climate: 'Tropical de sabana',
    estimatedPrice: 2500,
    currency: 'USD',
    tags: ['Safari', 'Leones', 'Migración', 'Playa', 'Naturaleza extrema'],
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80',
    description: 'La Gran Migración del Serengeti y las playas paradisíacas de Zanzíbar en un solo viaje. El safari definitivo de África Oriental.',
    rating: 5.0,
    region: 'africa',
    climateType: 'tropical',
    mainActivities: ['wildlife', 'adventure', 'beach'],
    travelStyles: ['romantic', 'active', 'solo'],
    luxuryLevel: 'premium',
    interestTags: ['safari', 'fotografía', 'naturaleza', 'leones', 'migración'],
    bestMonths: [6, 7, 8, 9, 10],
    avoidMonths: [3, 4],
  },
];

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function getDestinationById(id: string): DestinationEntry | undefined {
  return DESTINATION_DB.find((d) => d.id === id);
}

export function scoreDestination(
  dest: DestinationEntry,
  prefs: {
    region: string | null;
    climate: string | null;
    budget: number | null;
    mainActivity: string | null;
    travelStyle: string | null;
    luxuryLevel: string | null;
    interestTags: string[];
    month: string | null;
  }
): number {
  let score = 100;

  // ── HARD EXCLUSIONS (return -Infinity) ────────────────────────────────────
  if (prefs.region && dest.region !== prefs.region) return -Infinity;

  if (prefs.climate) {
    const compatible = CLIMATE_COMPAT[prefs.climate] ?? [];
    if (!compatible.includes(dest.climateType)) return -Infinity;
  }

  if (prefs.budget && dest.estimatedPrice > prefs.budget * 1.4) return -Infinity;

  // Hard activity check: skiing is strictly incompatible with tropical climate
  if (prefs.mainActivity === 'skiing' && (dest.climateType === 'tropical' || dest.climateType === 'subtropical')) {
    return -Infinity;
  }

  // ── SOFT SCORING ──────────────────────────────────────────────────────────

  // Main activity match
  if (prefs.mainActivity) {
    if (dest.mainActivities.includes(prefs.mainActivity as MainActivity)) {
      score += 35;
    } else {
      score -= 25;
    }
  }

  // Travel style match
  if (prefs.travelStyle && dest.travelStyles.includes(prefs.travelStyle as TravelStyle)) {
    score += 20;
  }

  // Luxury level match
  if (prefs.luxuryLevel && dest.luxuryLevel === prefs.luxuryLevel) {
    score += 15;
  }

  // Interest tag overlap
  if (prefs.interestTags.length > 0) {
    const overlap = prefs.interestTags.filter((t) => dest.interestTags.includes(t));
    score += Math.min(overlap.length * 8, 24);
  }

  // Season scoring
  if (prefs.month) {
    const monthNum = parseInt(prefs.month.split('-')[1], 10);
    if (dest.avoidMonths.includes(monthNum)) score -= 50;
    else if (dest.bestMonths.includes(monthNum)) score += 30;
  }

  return score;
}

export function getTopDestinations(
  prefs: Parameters<typeof scoreDestination>[1],
  limit = 4
): DestinationEntry[] {
  const scored = DESTINATION_DB.map((dest) => ({
    dest,
    score: scoreDestination(dest, prefs),
  }))
    .filter(({ score }) => score > -Infinity)
    .sort((a, b) => b.score - a.score);

  // If fewer than 3 results, relax mainActivity constraint and retry
  if (scored.length < 3 && prefs.mainActivity) {
    const relaxed = DESTINATION_DB.map((dest) => ({
      dest,
      score: scoreDestination(dest, { ...prefs, mainActivity: null }),
    }))
      .filter(({ score }) => score > -Infinity)
      .sort((a, b) => b.score - a.score);
    return relaxed.slice(0, limit).map(({ dest }) => dest);
  }

  return scored.slice(0, limit).map(({ dest }) => dest);
}
