# Florida Historical Explorer

## Overview

This is a full-stack web application that allows users to explore historical locations throughout Florida through an interactive map and detailed location information. Starting with 8 premium historical sites from St. Augustine to the Sebastian Inlet/Malabar area, the application features comprehensive stories, enhanced audio capabilities, and ready-to-monetize book recommendations. The platform supports user-submitted locations, photo galleries, and administrative approval workflows for maintaining content quality.

## Geographic Coverage

Florida Historical Explorer covers the entire state of Florida, including:
- **North Florida**: St. Augustine, Tallahassee, Jacksonville, Gainesville
- **Central Florida**: Orlando, Tampa Bay, Ocala National Forest, Crystal River
- **South Florida**: Miami, Fort Lauderdale, Palm Beach, Everglades
- **Southwest Florida**: Fort Myers, Naples, Sarasota, Sanibel Island
- **Florida Keys**: Key West, Key Largo, Marathon
- **Panhandle**: Pensacola, Panama City, Apalachicola

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React SPA built with Vite, using TypeScript and Tailwind CSS with shadcn/ui components
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with custom Florida-themed color palette
- **UI Components**: shadcn/ui component library with Radix UI primitives

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and caching
- **Form Handling**: React Hook Form with Zod validation
- **Interactive Maps**: Dynamic import of Leaflet for map functionality
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints

### Backend Architecture
- **RESTful API**: Express.js with TypeScript for type safety
- **Database Layer**: Drizzle ORM with PostgreSQL dialect
- **File Structure**: Clean separation of routes, storage, and utilities
- **Error Handling**: Centralized error handling middleware
- **Development Tools**: Hot reloading with Vite integration

### Database Schema
- **Locations**: Core entity with geographical coordinates, descriptions, categories, and approval status
- **Photos**: Associated images with captions linked to locations
- **Admins**: Administrative users for content moderation
- **Status Workflow**: Pending/approved/rejected states for submitted content

## Historical Categories

### Spanish Colonial Heritage
- **St. Augustine Historic District**: Oldest continuously inhabited European-established settlement
- **Castillo de San Marcos**: 17th-century Spanish fortress
- **Mission San Luis**: Spanish colonial mission and Native American village

### Maritime & Military History
- **Fort Zachary Taylor**: Civil War fortress in Key West
- **Naval Air Station Pensacola**: Birthplace of Naval Aviation
- **Lighthouse networks**: Guiding ships through dangerous Florida waters

### Space History
- **Kennedy Space Center**: America's spaceport and lunar launch site
- **Cape Canaveral**: Historic launch complex and space exploration

### Native American Heritage
- **Seminole heritage sites**: Resistance and cultural preservation
- **Shell mounds and burial sites**: Ancient Florida indigenous cultures
- **Cultural centers**: Modern tribal educational facilities

### Natural & Environmental History
- **Everglades**: River of grass ecosystem and conservation efforts
- **Crystal River**: Manatee sanctuary and spring systems
- **Coral Castle**: Mystery of coral stone construction

## Data Flow

1. **User Interaction**: Users browse locations via interactive map or location cards
2. **Location Submission**: New locations are submitted with pending status
3. **Content Moderation**: Admins review and approve/reject submissions
4. **Data Persistence**: All data is stored in PostgreSQL with proper relationships
5. **Real-time Updates**: TanStack Query handles cache invalidation and updates

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **leaflet**: Interactive maps (dynamically loaded)

### UI and Styling
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe styling variants
- **lucide-react**: Icon library

### Form and Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation
- **drizzle-zod**: Database schema to Zod conversion

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend development
- **tsx**: TypeScript execution for backend development
- **Concurrent Development**: Frontend and backend run simultaneously

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations handle schema changes
- **Static Assets**: Express serves built frontend in production

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment detection for development/production modes
- **Replit Integration**: Special handling for Replit development environment

## User Preferences

Preferred communication style: Simple, everyday language.

## Initial Location Portfolio (8 Sites)

### **Spanish Colonial Heritage**
- **Castillo de San Marcos National Monument** - America's oldest masonry fortification (1672-1695)

### **Space Age History** 
- **Kennedy Space Center Visitor Complex** - America's premier spaceport since 1962

### **Environmental Heritage**
- **Everglades National Park** - Unique wetland ecosystem and conservation landmark
- **Pelican Island National Wildlife Refuge** - America's first wildlife refuge (Roosevelt 1903)

### **Pioneer & Agricultural Heritage**
- **Grant Grocery Store & Historic Settlement** - Florida's oldest operating store (1894)
- **Historic Jungle Trail** - 1920s citrus farming road through conservation areas

### **Maritime & Treasure Heritage**
- **McLarty Treasure Museum** - Built on 1715 Spanish fleet disaster site
- **Mel Fisher's Treasure Museum** - Legendary treasure hunter's family collection

## Book Recommendation Strategy

### Categories Implemented
- **Historical Fiction**: Award-winning novels set in Florida
- **True Crime**: Florida-based crime stories with educational value
- **Popular History**: Bestselling non-fiction about Florida
- **Guide Books**: Travel and nature guides
- **Specialized History**: Academic and location-specific content

### Featured Florida Literature
- **"Their Eyes Were Watching God" by Zora Neale Hurston** - Harlem Renaissance classic
- **"A Land Remembered" by Patrick Smith** - Florida pioneer saga
- **"Shadow Country" by Peter Matthiessen** - Everglades trilogy
- **Carl Hiaasen novels** - Modern Florida satire with historical context

## Enhanced Audio System Status ⚠️ READY FOR CONTENT

### **Audio Infrastructure Complete**
- **Enhanced Audio Player**: Florida orange theme with professional fallback messaging
- **Corruption Detection**: MP3 validation prevents playback issues
- **User Experience**: Shows "Audio narration temporarily unavailable" when needed
- **ElevenLabs Integration**: Ready for professional voice synthesis
- **System Status**: Clean audio database, enhanced serving with validation

## Future Feature Ideas

### Content Completion Priority
- **Audio Tours**: GPS-triggered narration for driving tours
- **Educational Partnerships**: Florida school curriculum integration
- **Seasonal Content**: Hurricane season history, tourism patterns
- **Author Connections**: Florida Writers Association partnerships

### Location Discovery Wizard
- Interest-based questionnaire (Spanish Colonial, Space History, Maritime Heritage, Everglades)
- Travel season and weather preferences
- Family-friendly vs. adult-focused content
- International visitor accommodations

### Mini-Podcasts
- 3-5 minute audio episodes per location with professional narration
- GPS-triggered audio when visiting locations
- Multiple episodes for major sites (St. Augustine, Kennedy Space Center)
- Bilingual support (English/Spanish) for international visitors

## Changelog

- January 2025: Initial Florida conversion from Pacific Northwest Historical Explorer
- January 2025: Created 3 premium Florida locations: Castillo de San Marcos, Kennedy Space Center, Everglades
- January 2025: Implemented Florida orange color scheme and branding
- January 2025: Added comprehensive book recommendation system with affiliate potential
- July 25, 2025: **MAJOR EXPANSION** - Added 5 additional premium locations around Malabar/Sebastian area
- July 25, 2025: Added Pelican Island National Wildlife Refuge (America's first, Roosevelt 1903)
- July 25, 2025: Added Grant Grocery Store & Historic Settlement (Florida's oldest operating store, 1894)
- July 25, 2025: Added treasure hunting heritage - McLarty Museum (1715 fleet site) & Mel Fisher Museum
- July 25, 2025: Added Historic Jungle Trail (1920s agricultural road through conservation areas)
- July 25, 2025: Enhanced audio system with corruption detection and Florida orange theming
- July 25, 2025: Updated all documentation for 8-location scope with comprehensive historical narratives