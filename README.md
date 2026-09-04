<!-- HEADER BANNER -->
![header](https://capsule-render.vercel.app/api?type=waving&color=0:ef4444,50:b91c1c,100:7f1d1d&height=200&section=header&text=Sahaara%20Safety%20Platform&fontSize=52&fontColor=ffffff&fontAlignY=38&desc=Next-Generation%20Emergency%20SOS%20%7C%20Live%20Location%20%7C%20Nearby%20Responder%20Alerts&descAlignY=60&descSize=18&animation=fadeIn)

# Sahaara

> A modern women’s safety platform with emergency SOS alerts, live location sharing, and trusted-contact notification workflows.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

## Why Sahaara Exists

Emergency-response tools are often slow, complicated, or dependent on users manually typing messages during high-stress situations.

Sahaara focuses on:

- Fast SOS activation
- Real-time location visibility
- Trusted-contact notification systems
- Mobile-friendly emergency workflows
- Privacy-conscious design

The goal is to reduce friction during emergencies and create a more accessible safety-support experience.

---

## Key Features

### Emergency SOS Trigger
Users can activate an emergency alert flow that immediately starts the notification pipeline.

### Live Location Sharing
Trusted contacts can receive real-time location information to improve response coordination.

### Proximity SOS Broadcast
Triggering an SOS writes an alert row to Supabase for every online user inside `NEXT_PUBLIC_TRACKING_RADIUS` metres, so the nearest people are reached first.

### Interactive Safety Mapping
MapLibre-powered map views provide location visualization and tracking workflows.

### Modern Full-Stack Architecture
Built with a scalable frontend stack using Next.js, TypeScript, Tailwind CSS, and Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend / BaaS | Supabase |
| Alerts | Supabase Realtime notifications |
| Maps | MapLibre |
| Deployment | Vercel |

---

## Architecture Overview

```mermaid
graph TD
    User[📱 Person in Distress] -->|1. Gesture / SOS Button| Client[⚡ Next.js 14 responsive web app]
    Client -->|2. Geolocation Stream| Supabase[(🗄️ Supabase Postgres / Auth)]
    Client -->|3. Trigger Emergency API| API[🚀 Next.js Serverless Route]
    API -->|4. Match online users within radius| Supabase
    API -->|5. Write SOS alert rows| Notifications[🔔 Supabase notifications table]
    Notifications -->|6. Real-time in-app alert| NearbyUsers[👥 Nearby Sahaara Users]
    Supabase -->|7. Real-time Map Feed| Map[🗺️ MapLibre Interactive Tracker]
    NearbyUsers -->|View Live Location| Map
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn
- Supabase project

### Installation

```bash
git clone https://github.com/Shaan-alpha/Sahaara_APP.git
cd Sahaara_APP
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_TRACKING_RADIUS=500
```

### Database Setup

Run `supabase-schema.sql` in your Supabase project's SQL Editor to create the `user_locations` and `notifications` tables the API routes depend on.

### Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Product Vision

Sahaara is designed as more than a messaging utility.

The long-term vision includes:

- gesture-based emergency activation
- AI-assisted risk detection
- offline-safe fallback workflows
- wearable integration
- emergency response escalation layers
- multilingual accessibility support

---

## Security & Privacy

- Sensitive credentials are managed through environment variables.
- Personal safety data should never be committed to Git.
- Production deployments should use HTTPS and secured API routes.
- Supabase keys should be rotated periodically.

---

## Future Improvements

- Push notifications
- Background location updates
- Native mobile wrapper
- Contact verification workflows
- Incident timeline exports
- Emergency analytics dashboard

---

## License

MIT License
