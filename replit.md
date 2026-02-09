# replit.md

## Overview

TransportGo is a transport/logistics mobile application built with React Native (Expo) and an Express backend. It connects customers who need goods transported with drivers who operate vehicles (auto, tempo, truck). The app features two user roles — **customers** who create bookings and track rides, and **drivers** who receive ride requests, verify pickups via OTP, and complete deliveries. The app is currently focused on the Indore, India region with mock locations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Mobile App)
- **Framework**: React Native with Expo SDK 54, using expo-router for file-based routing
- **Language**: TypeScript throughout
- **Navigation**: File-based routing via `expo-router` with nested layouts:
  - `app/index.tsx` — Login screen
  - `app/register.tsx` — Registration screen
  - `app/customer/` — Customer screens (home, new-booking, track-ride, history, rate-ride)
  - `app/driver/` — Driver screens (dashboard, requests, active-ride)
- **State Management**: React Context API with two main contexts:
  - `AuthContext` — Handles user authentication with demo users and AsyncStorage persistence
  - `BookingContext` — Manages booking lifecycle (create, accept, start, complete, cancel, rate) with AsyncStorage persistence
- **Data Fetching**: TanStack React Query is set up (`lib/query-client.ts`) with API helpers, though current data flow uses local state via AsyncStorage
- **Animations**: react-native-reanimated for UI animations
- **Maps**: react-native-maps with a web fallback (`MapWrapper.web.tsx` returns empty View)
- **Fonts**: Inter font family via `@expo-google-fonts/inter`
- **Haptics**: expo-haptics for tactile feedback on interactions

### Backend (Express Server)
- **Framework**: Express 5 running on Node.js
- **Entry point**: `server/index.ts`
- **Routes**: `server/routes.ts` — Currently minimal, creates HTTP server with placeholder for `/api` routes
- **Storage**: `server/storage.ts` — Uses in-memory storage (`MemStorage`) with a `Map` for users. Implements `IStorage` interface for future database swap
- **CORS**: Configured to allow Replit domains and localhost origins for Expo web development
- **Static serving**: In production, serves static web build; in development, proxies to Expo's Metro bundler

### Database Schema (Drizzle ORM)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema location**: `shared/schema.ts`
- **Current tables**:
  - `users` — id (UUID, auto-generated), username (text, unique), password (text)
- **Validation**: drizzle-zod for insert schema generation
- **Config**: `drizzle.config.ts` expects `DATABASE_URL` environment variable
- **Note**: The schema is defined but the app currently uses AsyncStorage for data persistence. The server uses in-memory storage. The database integration is set up but not fully wired.

### Key Design Decisions

1. **Offline-first with AsyncStorage**: Bookings and auth data persist locally. This was chosen for simplicity and works without requiring a running backend for the core flow. The backend infrastructure exists for future migration to server-side data.

2. **Demo users built-in**: Two hardcoded demo accounts (customer and driver) allow immediate testing without registration.

3. **Mock locations**: 10 predefined Indore locations are used instead of real geocoding, keeping the app functional without external map APIs.

4. **Flat pricing model**: Three vehicle types (auto, tempo, truck) with base fare + per-km pricing. Distance calculated via Haversine formula.

5. **OTP verification**: Drivers must enter a 4-digit OTP (generated at booking creation) to start a trip, ensuring pickup verification.

6. **Platform-aware components**: Map components have separate native and web implementations. Haptics are conditionally used based on platform.

### Build & Run

- **Development**: Two processes needed — `npm run server:dev` (Express on port 5000) and `npm run expo:dev` (Expo Metro bundler)
- **Production build**: `npm run expo:static:build` builds web assets, `npm run server:build` bundles server, `npm run server:prod` serves everything
- **Database**: `npm run db:push` pushes Drizzle schema to PostgreSQL

## External Dependencies

- **PostgreSQL**: Required for Drizzle ORM (needs `DATABASE_URL` environment variable). Currently not actively used — the app runs on in-memory/AsyncStorage
- **Expo Services**: Expo SDK for build tooling, splash screen, fonts, etc.
- **GitHub Integration**: `scripts/push-to-github.ts` uses Octokit with Replit's GitHub connector for repository sync
- **No external APIs currently**: Maps use react-native-maps (no API key configured for web), locations are mocked, pricing is calculated locally