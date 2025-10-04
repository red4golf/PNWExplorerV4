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
- SEO optimization through dynamic meta tags, structured data (JSON-LD), Open Graph/Twitter cards, and sitemap generation.
- Integrated book recommendation system with affiliate links.
- User analytics tracking engagement patterns with enhanced developer exclusion.
- Future potential for an audio tour system.

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