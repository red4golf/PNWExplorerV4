# Pacific Northwest Historical Explorer

## Overview
This is a full-stack web application designed to be the definitive digital guide for exploring historical locations across the Pacific Northwest (Washington, Oregon, Northern California, Idaho, Montana, and Southern British Columbia). It provides an interactive map, detailed location information, user-submitted content capabilities, and administrative workflows for content quality. The project aims to become a comprehensive educational resource and tourism aid, enhancing the discovery and appreciation of the region's rich history.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application uses a monorepo structure, separating client, server, and shared components.

### Frontend
- **Framework**: React SPA with Vite, TypeScript.
- **Styling**: Tailwind CSS with shadcn/ui components, custom heritage-themed color palette.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: TanStack Query for server state and caching.
- **Form Handling**: React Hook Form with Zod validation.
- **Interactive Maps**: Dynamically loaded Leaflet for map functionality.
- **Design**: Mobile-first responsive approach.

### Backend
- **API**: Express.js REST API with TypeScript for type safety.
- **Database Layer**: Drizzle ORM with PostgreSQL dialect.
- **Structure**: Clean separation of routes, storage, and utilities.
- **Error Handling**: Centralized middleware.

### Database Schema
- **Locations**: Geographical coordinates, descriptions, categories, approval status.
- **Photos**: Images and captions linked to locations.
- **Admins**: Users for content moderation.
- **Content Workflow**: Pending/approved/rejected states for submitted content.
- **File Storage**: Files are stored directly in the PostgreSQL database (BYTEA) with automatic environment detection for deployed environments, or locally for development.
- **Analytics**: `user_analytics` table for tracking user engagement (page views, location views, QR code scans, shares).
- **Book Recommendations**: Structured JSON for title, author, description, format, price, and Amazon URLs.

### Core Features
- Interactive map with GPS location, directions, and dynamic centering for the PNW region.
- Comprehensive location management system with search, edit forms, and markdown rendering for extended stories.
- Photo management system supporting hero images and multiple gallery photos per location, with bulk selection and responsive display.
- Comprehensive SEO optimization including dynamic meta tags, structured data (JSON-LD), Open Graph/Twitter cards, and sitemap generation.
- Integrated book recommendation system for all historical locations.
- User analytics tracking for engagement patterns (excluding developer traffic).
- Potential future feature: Audio tour system (currently unavailable due to content regeneration needs).

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connection.
- **drizzle-orm**: Type-safe database ORM.
- **@tanstack/react-query**: Server state management.
- **wouter**: Lightweight React router.
- **leaflet**: Interactive maps.

### UI and Styling
- **@radix-ui/***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Type-safe styling variants.
- **lucide-react**: Icon library.

### Form and Validation
- **react-hook-form**: Form state management.
- **@hookform/resolvers**: Form validation resolvers.
- **zod**: Schema validation.
- **drizzle-zod**: Database schema to Zod conversion.

### Other Integrations
- **Google Maps**: For turn-by-turn directions.
- **Amazon Associates program**: For future affiliate link integration in book recommendations.
- **ElevenLabs AI**: (Previously used for audio synthesis, currently not active for content generation).
- **Make.com**: Automation system for feedback collection and social media posting.