export type MessageRole = 'user' | 'assistant';
export type MessageType = 'text' | 'destinations' | 'flights' | 'question' | 'error';

export type ConversationStage =
  | 'discovery'
  | 'refinement'
  | 'destination_selection'
  | 'date_selection'
  | 'flight_search';

export interface ConversationPreferences {
  // HARD CONSTRAINTS — once set, all recommendations must respect these
  region: string | null;        // 'asia' | 'europe' | 'south_america' | 'caribbean' | 'central_america' | 'north_america' | 'oceania' | 'africa'
  climate: string | null;       // 'warm' | 'cold' | 'temperate'
  budget: number | null;        // max USD per person for flight
  mainActivity: string | null;  // 'skiing' | 'beach' | 'diving' | 'trekking' | 'city' | 'wildlife' | 'culture' | 'wellness' | 'adventure'
  // SOFT PREFERENCES — influence ranking but don't exclude
  travelStyle: string | null;   // 'active' | 'relax' | 'party' | 'romantic' | 'family' | 'solo'
  luxuryLevel: string | null;   // 'budget' | 'midrange' | 'premium'
  interestTags: string[];       // e.g. ['gastronomia', 'fotografía', 'surf', 'yoga']
  // LOGISTICS
  travelers: number;
  month: string | null;         // YYYY-MM
  tripDuration: string | null;  // 'weekend' | 'week' | 'twoweeks' | 'month'
  originCity: string | null;
  originIata: string | null;
}

export interface ConversationState {
  stage: ConversationStage;
  preferences: ConversationPreferences;
  shortlistedDestinations: Destination[];
  rejectedDestinationIds: string[];
  confirmedDestination: Destination | null;
  departureDate: string | null;   // YYYY-MM-DD
  returnDate: string | null;      // YYYY-MM-DD
  turnCount: number;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  climate: string;
  estimatedPrice: number;
  currency: string;
  tags: string[];
  imageUrl: string;
  description: string;
  rating?: number;
}

export interface Flight {
  flightNumber: string;
  airline: string;
  airlineLogo?: string;
  route: string;
  originAirport?: string;
  destinationAirport?: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  nonstop: boolean;
  price: number;
  currency: string;
  cabinClass?: string;
  searchDate?: string;
  returnDate?: string;
  previousFare?: number;
  fareChanged?: boolean;
  fareDifference?: number;
  percentageChange?: number;
  trendEmoji?: string;
  recommendation?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  type?: MessageType;
  recommendations?: Destination[];
  flights?: Flight[];
  isLoading?: boolean;
  loadingVariant?: 'thinking' | 'searching_flights';
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  conversationState: ConversationState;
}

export interface ChatResponse {
  type: MessageType;
  content: string;
  recommendations?: Destination[];
  flights?: Flight[];
  conversationState?: ConversationState;
}

export interface QuickPrompt {
  text: string;
  emoji: string;
}
