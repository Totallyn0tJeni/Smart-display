# Smart Display

## Overview

A modern smart display dashboard application designed for touchscreen devices like Raspberry Pi displays. The app features a glassmorphism UI with multiple widgets including a clock, photo gallery, calendar integration, Spotify player, LED light controls, focus timer, weather display, and media apps. Originally inspired by a Flask/Python implementation, this version is rebuilt as a full-stack TypeScript application.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with custom glassmorphism utility classes
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for smooth transitions and interactions
- **Typography**: Custom fonts (Inter for body, Outfit for display headings)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **Development**: tsx for TypeScript execution, Vite middleware for HMR

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` - contains tables for LED states, photos, and focus sessions
- **Migrations**: Drizzle Kit with `db:push` command for schema synchronization

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and Zod validation schemas
- `routes.ts`: API route definitions with request/response type contracts

### Key Design Decisions

1. **Glassmorphism UI**: Heavy use of `backdrop-blur`, semi-transparent backgrounds, and subtle borders to create a modern, translucent aesthetic suitable for ambient displays.

2. **Hardware Abstraction**: LED control logic in `server/routes.ts` simulates Raspberry Pi GPIO operations. The hardware loop runs independently, applying RGB values based on stored mode (static, pulse, fade, sunrise).

3. **Type-Safe API Contracts**: Routes defined with Zod schemas ensure type safety across the full stack. Frontend hooks in `client/src/hooks/` consume these typed endpoints.

4. **Component Composition**: Apps are implemented as separate components (SpotifyApp, PhotosApp, CalendarApp, etc.) that can be independently opened from the home screen.

## External Dependencies

### Database
- **PostgreSQL**: Required via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database abstraction with `drizzle-orm` and `drizzle-zod` for schema validation
- **Session Store**: `connect-pg-simple` for Express session persistence

### UI Libraries
- **Radix UI**: Comprehensive accessible component primitives (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-configured component styling based on Radix
- **Framer Motion**: Animation library for page transitions
- **react-colorful**: Color picker component for LED controls
- **date-fns**: Date formatting utilities
- **Lucide React**: Icon library
- **react-icons**: Additional icon sets (YouTube, etc.)

### Build & Development
- **Vite**: Frontend bundler with React plugin
- **esbuild**: Server bundling for production
- **Tailwind CSS**: Utility-first CSS framework with PostCSS/Autoprefixer

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal`: Error overlay during development
- `@replit/vite-plugin-cartographer`: Development tooling
- `@replit/vite-plugin-dev-banner`: Development environment indicator