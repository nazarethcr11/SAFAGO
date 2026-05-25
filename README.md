# SAFAGO — Plataforma de Recomendación Turística con IA

SAFAGO es una plataforma web que usa inteligencia artificial para recomendar destinos turísticos personalizados y buscar vuelos en tiempo real mediante conversación natural.

## Stack tecnológico

- **Framework**: Next.js 14 (App Router)
- **UI**: React + TypeScript + TailwindCSS
- **Animaciones**: Framer Motion
- **Estado**: Zustand
- **HTTP**: Axios
- **Backend IA**: N8N + Google Gemini
- **Vuelos**: SerpAPI (Google Flights)
- **Deploy**: Vercel

## Arquitectura

```
safago/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── chat/page.tsx       # Chat interface
│   └── api/chat/route.ts   # Proxy → N8N webhook
├── components/
│   ├── ui/                 # Button, Badge, LoadingDots
│   ├── landing/            # Navbar, Hero, HowItWorks, Benefits, Footer
│   └── chat/               # ChatInterface, ChatMessage, ChatInput, cards
├── features/               # Lógica de negocio
├── services/               # chatService.ts (HTTP calls)
├── hooks/                  # useChat, useAutoScroll
├── store/                  # chatStore.ts (Zustand)
├── types/                  # TypeScript types globales
├── lib/                    # utils.ts, mockResponses.ts
└── utils/                  # constants.ts, formatters.ts
```

## Flujo de datos

```
Usuario → Chat UI
         → POST /api/chat (Next.js)
            → N8N Webhook (POST)
               → Google Gemini (extrae intención + detalles)
               → SerpAPI/Google Flights (si info completa)
               → JSON response
            → Frontend renderiza mensajes + cards
```

## Configuración rápida

### 1. Clonar e instalar

```bash
git clone <tu-repo>
cd safago
npm install
```

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:

```env
# URL del webhook de N8N (ver sección N8N más abajo)
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/safago-chat

# URL pública (para producción)
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Sin `N8N_WEBHOOK_URL` configurado, la app usa respuestas mock para desarrollo.

## Configuración de N8N

### Importar el workflow

1. Abre N8N → Importar workflow
2. Selecciona `n8n-workflow.json`
3. Configura las credenciales:
   - **Google Gemini**: Agrega tu API key de Google AI Studio
   - **SerpAPI**: Agrega tu API key de SerpAPI (guárdala como variable de entorno `SERPAPI_KEY`)

### Variables de entorno en N8N

En N8N, ve a Settings → Variables y agrega:

```
SERPAPI_KEY = tu_api_key_de_serpapi
```

### Activar el webhook

1. Activa el workflow
2. Copia la URL del nodo "Webhook" (formato: `https://tu-n8n.com/webhook/safago-chat`)
3. Pégala en `N8N_WEBHOOK_URL` de tu `.env.local`

### Estructura del request/response

**Request (Frontend → N8N):**
```json
{
  "message": "Quiero ir a Cancún en agosto para 2 personas",
  "sessionId": "uuid-de-sesion"
}
```

**Response (N8N → Frontend):**

Texto simple:
```json
{
  "type": "text",
  "content": "Mensaje del asistente",
  "flights": [],
  "recommendations": []
}
```

Con destinos recomendados:
```json
{
  "type": "destinations",
  "content": "Aquí tienes mis recomendaciones...",
  "recommendations": [
    {
      "id": "1",
      "name": "Cancún",
      "country": "México",
      "climate": "Tropical",
      "estimatedPrice": 450,
      "currency": "USD",
      "tags": ["Playa", "Sol"],
      "imageUrl": "https://...",
      "description": "...",
      "rating": 4.7
    }
  ],
  "flights": []
}
```

Con vuelos:
```json
{
  "type": "flights",
  "content": "Encontré los mejores vuelos...",
  "flights": [
    {
      "flightNumber": "LA2091",
      "airline": "LATAM Airlines",
      "route": "LIM-CUN",
      "departureTime": "2026-08-15T06:30:00",
      "arrivalTime": "2026-08-15T16:45:00",
      "durationMinutes": 615,
      "stops": 1,
      "nonstop": false,
      "price": 420,
      "currency": "USD",
      "trendEmoji": "📉",
      "recommendation": "Conviene comprar ahora"
    }
  ],
  "recommendations": []
}
```

## Deploy en Vercel

### Desde GitHub

1. Sube el código a GitHub
2. Conecta el repo en [vercel.com](https://vercel.com)
3. En Vercel → Settings → Environment Variables, agrega:
   - `N8N_WEBHOOK_URL` = tu URL de N8N

### Desde CLI

```bash
npm install -g vercel
vercel --prod
```

## Desarrollo sin N8N

Si no tienes N8N configurado, el sistema devuelve respuestas mock inteligentes basadas en keywords del mensaje. Edita `lib/mockResponses.ts` para personalizar las respuestas de desarrollo.

## Scripts

```bash
npm run dev          # Servidor de desarrollo (localhost:3000)
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run type-check   # Verificar tipos TypeScript
npm run lint         # ESLint
```
