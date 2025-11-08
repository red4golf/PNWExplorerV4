# Pacific Northwest Historical Explorer

## Overview
This full-stack web application serves as a comprehensive digital guide to historical locations across the Pacific Northwest (Washington, Oregon, Northern California, Idaho, Montana, and Southern British Columbia). It features an interactive map, detailed location information, user-submitted content capabilities, and administrative tools for content moderation. The project aims to be a valuable educational resource and tourism aid, promoting the discovery and appreciation of the region's rich history.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application is built as a monorepo, separating client, server, and shared components.

### Frontend
- **Framework**: React SPA with Vite and TypeScript.
- **Styling**: Tailwind CSS with shadcn/ui components, using a heritage-themed color palette.
- **Routing**: Wouter for client-side routing.
- **State Management**: TanStack Query for server state.
- **Form Handling**: React Hook Form with Zod validation.
- **Interactive Maps**: Leaflet is used for dynamic map functionalities.
- **Design**: Mobile-first responsive design approach.

### Backend
- **API**: Express.js REST API developed with TypeScript.
- **Database Layer**: Drizzle ORM interfaces with a PostgreSQL database.
- **Structure**: Employs a clean architecture with clear separation of concerns for routes, storage, and utilities.
- **Error Handling**: Centralized middleware for robust error management.

### Database Schema
- **Entities**: Includes tables for `Locations`, `Photos`, `Admins`, `user_analytics`, and `Book Recommendations`.
- **Content Workflow**: Supports `pending`, `approved`, and `rejected` states for user-submitted content.
- **File Storage**: Images are stored as BYTEA in PostgreSQL.
- **Analytics**: `user_analytics` tracks user engagement with automatic developer exclusion.

### Core Features
- Interactive map with GPS, directions, and dynamic centering.
- Comprehensive location management including search, edit forms, and markdown support for stories.
- Photo management supporting hero images and galleries with bulk selection.
- SEO optimization through dynamic meta tags, structured data (JSON-LD), Open Graph/Twitter cards, sitemap generation, and SEO-friendly URLs.
- Integrated book recommendation system with affiliate links.
- User analytics tracking engagement patterns with enhanced developer exclusion and design mode preference tracking.
- Dual design system with toggle between modern and classic interfaces.
- Future potential for an audio tour system.

### SEO-Friendly URLs
The application uses human-readable slugs in location URLs for improved SEO and user experience.

#### URL Format
- **Current Format**: `/location/{slug}` (e.g., `/location/ye-olde-curiosity-shop`)
- **Legacy Format**: `/location/{id}` (e.g., `/location/149`) - Supported for backward compatibility

#### Implementation
- **Slug Generation**: Auto-generated from location names using `LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))`
- **Database**: `slug` field in locations table with unique constraint
- **Backend**: Route handlers support both slugs and numeric IDs using `/^\d+$/` regex detection
- **Frontend**: All navigation updated to use slugs (location cards, detail pages, SEO canonical URLs)
- **Insert Schema**: Slug field excluded from insertLocationSchema for automatic generation

### Design System
The application features a user-selectable design system offering both modern and classic interfaces, allowing visitors to choose their preferred aesthetic while maintaining full functionality in both modes.

#### Design Modes
- **Modern Design** (Default): Contemporary aesthetic with dark hero overlays, timeline story layouts, gradient accents, and sophisticated color palette
- **Classic Design**: Traditional heritage-themed interface preserving the original brown/gold/cream color scheme and conventional layouts

#### Implementation
- **Context Provider**: DesignModeProvider wraps the application and manages design state
- **Storage**: User preference persisted in localStorage under key "pnw-design-mode"
- **Components**: Each major view has separate Modern and Classic components that render conditionally based on design mode
  - Home page: ModernHome and ClassicHome
  - Location detail: ModernLocationDetail and ClassicLocationDetail
- **Toggle Button**: DesignToggle component in header allows instant switching between modes
- **Analytics Integration**: Design mode preference and toggle events tracked for user insights

#### Modern Design Features
- **Color Palette**: 
  - Sage green (#5c8a89), terra cotta (#e07856), warm cream (#e8dcc8)
  - Dark backgrounds with subtle gradients
- **Landing Page**: Hero section with tagline, featured locations grid, category filter pills, dual-range time period sliders (1800-2000), interactive SVG map preview
- **Location Detail**: Dark hero with overlay and integrated audio player, timeline-style story layout, sidebar with photo grid and compact map
- **Visual Style**: Rounded corners (2xl/3xl), gradient overlays, modern typography, sophisticated spacing

#### Classic Design Features
- **Color Palette**: Heritage browns, golds, and creams from original design
- **Landing Page**: Traditional intro view with centered content, straightforward location list
- **Location Detail**: Light hero image, conventional story layout, full-width content sections
- **Visual Style**: Traditional layout patterns, simpler styling, familiar heritage aesthetics

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connectivity.
- **drizzle-orm**: Type-safe ORM for database interactions.
- **@tanstack/react-query**: Manages server state and caching.
- **wouter**: Lightweight routing for React applications.
- **leaflet**: Provides interactive mapping capabilities.

### UI and Styling
- **@radix-ui/***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: For type-safe styling variants.
- **lucide-react**: Icon library.

### Form and Validation
- **react-hook-form**: Handles form state and validation.
- **@hookform/resolvers**: Integrates validation schemas with React Hook Form.
- **zod**: Schema validation library.
- **drizzle-zod**: Converts Drizzle ORM schemas to Zod schemas.

### Other Integrations
- **Google Maps**: Used for providing turn-by-turn directions.
- **Amazon Associates program**: Planned for affiliate link integration in book recommendations.
- **ElevenLabs AI**: Utilized for generating high-quality audio tours and narrations.
- **Make.com**: Automation platform for feedback collection and social media posting.