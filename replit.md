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
- **Analytics**: `user_analytics` table for tracking user engagement (page views, location views, QR code scans, shares) with automatic developer exclusion.
- **Book Recommendations**: Structured JSON for title, author, description, format, price, and Amazon URLs.

### Core Features
- Interactive map with GPS location, directions, and dynamic centering for the PNW region.
- Comprehensive location management system with search, edit forms, and markdown rendering for extended stories.
- Photo management system supporting hero images and multiple gallery photos per location, with bulk selection and responsive display.
- Comprehensive SEO optimization including dynamic meta tags, structured data (JSON-LD), Open Graph/Twitter cards, and sitemap generation.
- Integrated book recommendation system for all historical locations.
- User analytics tracking for engagement patterns with enhanced developer exclusion (admin users, development domains, manual dev-mode flag).
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

## Analytics & Privacy
The application implements anonymous user analytics with strong privacy protections:

### Developer Exclusion System
- **Admin users**: Automatically excluded from tracking
- **Development domains**: replit.dev, localhost auto-detected
- **Manual exclusion**: Set `localStorage.setItem('dev-mode', 'true')` in browser console
- **No personal data**: Only aggregate usage patterns collected

### Tracked Events (Anonymous)
- Page views and location visits for content optimization
- Geographic regions (timezone-based) for audience insights  
- Affiliate link clicks for revenue tracking
- User flow patterns for UX improvements

### Privacy Compliance
- No individual user identification or personal data
- No cross-site tracking or persistent cookies
- GDPR/CCPA compliant without consent requirements
- Raw analytics dashboard shows only factual database counts

## Recent Changes
- **August 2025**: **CRITICAL SAFETY FIX** - Corrected Frog Rock coordinates to exact address 14607 Phelps Rd NE (47.6965465, -122.5234931) after user reported incorrect location was directing to private driveway
- **August 2025**: Fixed critical map initialization issue - map now loads immediately instead of waiting for location permission, improving user experience significantly
- **August 2025**: Completed comprehensive book verification audit with systematic ASIN replacement across all 80 locations, achieving 83-90% Amazon link success rates
- **August 2025**: Created systematic book verification table (book_verification_table.md) for ongoing quality assurance and manual verification process
- **August 2025**: Eliminated all generic placeholder ASINs and replaced with authentic, regionally-appropriate book recommendations for all historical locations
- **August 2025**: CRITICAL DISCOVERY - Systematic ISBN/ASIN mismatch problem causing wrong book redirects (e.g., Oregon Lighthouses linking to Watertown WI book)
- **August 2025**: Fixed 80 confirmed locations with verified Amazon ISBNs including comprehensive Pacific Northwest regional coverage
- **January 2025**: Analytics system reset for public beta launch with enhanced developer exclusion
- **January 2025**: Fixed Amazon affiliate link functionality (camelCase/snake_case mismatch resolved)
- **January 2025**: Comprehensive data integrity review completed - production ready for deployment
- **January 2025**: Press release and newsletter announcement created for public beta launch with audio tour roadmap