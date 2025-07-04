# Pacific Northwest Historical Explorer

## Overview

This is a full-stack web application that allows users to explore historical locations throughout the Pacific Northwest (Washington, Oregon, Northern California, Idaho, Montana, and Southern British Columbia) through an interactive map and detailed location information. The application supports user-submitted locations, photo galleries, and administrative approval workflows for maintaining content quality.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React SPA built with Vite, using TypeScript and Tailwind CSS with shadcn/ui components
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with custom heritage-themed color palette
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

## Changelog

Changelog:
- July 01, 2025. Initial setup
- July 01, 2025. Added GPS location functionality to interactive map - users can now see their current position relative to historical locations
- July 01, 2025. Added database integration with PostgreSQL - replaced in-memory storage with persistent database
- July 01, 2025. Added directions functionality - users can get turn-by-turn directions to historical locations via Google Maps integration
- July 01, 2025. Improved mobile experience - created clean intro screen with hero image and "Start Exploring" button, map appears only when button is pressed
- July 01, 2025. Fixed mobile UI issues - corrected button text visibility on welcome screen and confirmed directions open in new window
- July 01, 2025. Expanded scope to Pacific Northwest - updated app to cover Washington, Oregon, Northern California, Idaho, Montana, and Southern BC with smart location-based map centering
- July 01, 2025. Enhanced map functionality - moved legend below map, added full functionality to all control buttons (Filter, Search, List View)
- July 01, 2025. Added Pacific Northwest sample data - included historical locations from across WA, OR, and ID
- July 01, 2025. Fixed location detection boundaries - corrected longitude coordinate logic for proper PNW boundary detection, map now centers correctly on user location within region
- July 01, 2025. Added 10 additional historical locations - expanded database with diverse sites including Fort Clatsop, Columbia River Gorge, Bonneville Dam, Celilo Falls, Snoqualmie Falls, Oregon State Capitol, Hanford Site, Coeur d'Alene Mission, Glacier National Park, and Skagit Valley Tulip Fields
- July 01, 2025. Updated all page headers and branding - changed references from "Bainbridge Island" to "Pacific Northwest" across submit location page, admin page, and main header component
- July 01, 2025. Added comprehensive location management system - created "Manage Locations" admin tab with search functionality, edit forms for all location data including extended story content, and database cleanup to remove duplicate entries
- July 01, 2025. Added markdown rendering to location detail pages - extended story content now displays with proper formatting including headings, paragraphs, bold text, and other markdown features
- July 01, 2025. Created Fort Casey location with rich historical narrative - added detailed story about the coastal fortification on Whidbey Island with markdown formatting
- July 01, 2025. Fixed location detail page navigation and maps - "Back to Map" button now properly returns to map view, added embedded OpenStreetMap displays for each location
- July 01, 2025. Added Pia the Peacekeeper location - created entry for Thomas Dambo's troll sculpture in Sakai Park with full community creation story and environmental stewardship narrative
- July 01, 2025. Enhanced existing locations with rich stories - updated Port Blakely Mill and Fort Clatsop with detailed historical narratives
- July 01, 2025. Added 6 major Pacific Northwest historical locations - created Ebey's Landing, Yama Village, Pioneer Square/Klondike Gold Rush, Whitman Mission, San Juan Island Pig War, and Mount St. Helens with comprehensive markdown-formatted stories covering pioneer settlement, cultural heritage, economic transformation, international diplomacy, and natural disasters
- July 01, 2025. Created 7 additional authentic historical stories - added researched narratives for Japanese American Exclusion Memorial, Celilo Falls, Pike Place Market, Multnomah Falls, Historic Strawberry Fields, Snoqualmie Falls, and Oregon Trail Interpretive Center covering WWII civil rights violations, Native American cultural losses, agricultural heritage, and westward expansion
- July 01, 2025. Completed comprehensive historical stories for all locations - added authentic narratives for 15 remaining sites including Bonneville Dam, Columbia River Gorge, Crater Lake, Point No Point Lighthouse, Mount Rainier, Nez Perce National Historical Park, Oregon State Capitol, Craters of the Moon, Coeur d'Alene Mission, Glacier National Park, Skagit Valley Tulip Fields, and others. All 33 approved locations now feature detailed educational content with proper historical accuracy and respectful cultural treatment
- July 03, 2025. Added 5 additional historically significant locations - created comprehensive stories for Kennewick Man Discovery Site (archaeological prehistory), Walla Walla Valley Wine Country (agricultural transformation), Manzanar National Historic Site (WWII civil liberties), Astoria Column (cultural convergence monument), and Hanford B Reactor (Manhattan Project nuclear site). Database now contains 38 total locations with authentic educational content covering diverse Pacific Northwest themes
- July 03, 2025. Added The Goonies House in Astoria - created comprehensive story about the iconic 1985 film location, covering Hollywood production in small-town Oregon, cultural phenomenon impact, film tourism economics, and generational appeal. Database now contains 39 total locations spanning prehistoric times to modern pop culture
- July 03, 2025. Added 5 additional diverse historical locations - created comprehensive stories for Oregon Vortex (natural mystery), Rajneeshpuram (religious commune experiment), Underground Seattle (urban engineering marvel), Treaty Rock (Native American treaty site), Duwamish Longhouse (indigenous cultural center), and Columbia River Gorge Wind Farms (renewable energy innovation). Database now contains 44 total locations covering extraordinary diversity of Pacific Northwest themes from prehistoric to contemporary times
- July 03, 2025. Added 5 Olympic Peninsula and Oregon locations - created comprehensive stories for Shanghai Tunnels Portland (maritime crime and shanghaing), Olympic Hot Springs (sacred waters to wilderness), Tillamook Rock Lighthouse (extreme lighthouse engineering), Neah Bay and Cape Flattery (Makah whaling culture), and Oregon Caves National Monument (ancient limestone formations). Database now contains 49 total locations spanning maritime crime, indigenous sovereignty, geological wonders, and cultural resilience
- July 03, 2025. Added 5 western Montana and British Columbia locations - created comprehensive stories for Little Bighorn Battlefield (indigenous resistance), Fort Steele Heritage Town (North West Mounted Police frontier law), Head-Smashed-In Buffalo Jump (ancient Plains hunting culture), Barkerville Historic Town (Cariboo Gold Rush boomtown), and Athabasca Oil Sands (modern energy development). Database now contains 54 total locations covering military history, law enforcement, ancient traditions, gold rush culture, and contemporary environmental challenges
- July 03, 2025. Corrected geographic boundaries - removed Little Bighorn Battlefield, Head-Smashed-In Buffalo Jump, and Athabasca Oil Sands as they fall outside Pacific Northwest boundaries. Retained Fort Steele Heritage Town and Barkerville Historic Town (BC). Database now contains 51 total locations, all within proper Pacific Northwest region (WA, OR, Northern CA, ID, MT, Southern BC)
- July 03, 2025. Added 5 more Pacific Northwest locations with Northern California and Idaho focus - created comprehensive stories for Redwood National and State Parks (ancient forest conservation), Shasta Dam (California water infrastructure), Sun Valley Resort (ski industry innovation), Sawtooth National Recreation Area (Idaho wilderness), and Lava Beds National Monument (volcanic geology and Modoc War). Database now contains 56 total locations covering complete Pacific Northwest geographic representation
- July 03, 2025. Enhanced user interface with advanced features - implemented tabbed navigation for map controls (Controls/Search & Filter/Location List), added multi-level filtering by category and time period, integrated smart search functionality, distance-based sorting, real-time statistics display, and enhanced home page with statistical dashboard showcasing 56 locations across Natural Wonders, Historical Sites, and Cultural Heritage categories
- July 04, 2025. Added comprehensive photo management system - implemented hero image upload functionality for each location, added database schema support for heroImage field, created admin interface for uploading/managing location images with file validation (JPEG, PNG, GIF, WebP up to 5MB), integrated photo display in location cards and detail pages, added visual indicators in admin panel showing which locations have custom images versus placeholder images
- July 04, 2025. Added complete Puget Sound coastal defense system - expanded existing Fort Casey with Fort Worden & Battery Kinzie (featuring revolutionary disappearing gun technology and Hollywood fame from "An Officer and a Gentleman"), Fort Flagler (first activated fort in the system), and Fort Ward on Bainbridge Island (the fourth fort protecting Bremerton Naval Shipyard and serving as top-secret "Station S" intelligence center during WWII and Cold War), completing the full four-fort network that protected Puget Sound from 1897-1958 with historically accurate content covering military engineering, strategic positioning, intelligence operations, and cultural transformation from fortress to parks and residential neighborhoods