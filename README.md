# Pacific Northwest Historical Explorer

An advanced interactive historical places explorer for the Pacific Northwest, focusing on immersive geospatial storytelling with robust book recommendation and affiliate tracking capabilities.

## 🌲 About

This application serves as the definitive digital guide for exploring historical locations across the Pacific Northwest including Washington, Oregon, Northern California, Idaho, Montana, and Southern British Columbia. It provides an interactive map, detailed location information, user-submitted content capabilities, and administrative workflows for content quality.

## ✨ Key Features

- **Interactive Map**: Dynamic Leaflet-based map with GPS location, directions, and centering for the PNW region
- **80+ Historical Locations**: Comprehensive database of significant historical sites with detailed descriptions
- **Book Recommendations**: Curated book suggestions for each location with Amazon affiliate links
- **Photo Gallery**: Hero images and multiple gallery photos per location with responsive display
- **SEO Optimized**: Dynamic meta tags, structured data (JSON-LD), Open Graph/Twitter cards, and sitemap generation
- **Analytics**: Privacy-first anonymous user tracking with developer exclusion
- **Mobile-First Design**: Responsive design optimized for all devices

## 🛠 Tech Stack

### Frontend
- **React** with TypeScript and Vite
- **Tailwind CSS** with shadcn/ui components
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Leaflet** for interactive maps

### Backend
- **Express.js** REST API with TypeScript
- **Drizzle ORM** with PostgreSQL
- **File Storage**: PostgreSQL BYTEA for deployed environments

### Database
- **PostgreSQL** with comprehensive schema including:
  - Locations with coordinates, descriptions, categories
  - Photos with captions and gallery support
  - Analytics tracking with privacy protection
  - Book recommendations with affiliate tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables configured

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pnw-historical-explorer.git
cd pnw-historical-explorer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and other configurations
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📖 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configuration
├── server/                # Express.js backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database interface
│   └── db.ts              # Database connection
├── shared/                # Shared types and schemas
│   └── schema.ts          # Drizzle database schema
└── uploads/               # File uploads (development only)
```

## 🗺 Geographic Coverage

The application covers historical locations across:
- **Washington State**: Seattle, Olympic Peninsula, Puget Sound, Eastern Washington
- **Oregon**: Portland, Coast Range, Cascade Mountains, Eastern Oregon  
- **Northern California**: Redwood Coast, Gold Country, Sacramento Valley
- **Idaho**: Boise area, Panhandle, Sun Valley, Snake River Plain
- **Montana**: Glacier National Park, Gold Rush towns, Yellowstone gateway
- **Southern British Columbia**: Vancouver area, Fraser Valley, Cariboo

## 📊 Analytics & Privacy

The application implements anonymous user analytics with strong privacy protections:

- **Developer Exclusion**: Admin users and development domains automatically excluded
- **No Personal Data**: Only aggregate usage patterns collected
- **GDPR/CCPA Compliant**: No consent requirements due to anonymous nature
- **Tracked Events**: Page views, location visits, affiliate clicks for optimization

## 🔗 Affiliate Program

The application includes comprehensive book recommendations with Amazon affiliate links:
- 160+ curated books across 80 locations
- Verified authentic regional content
- Historical accuracy and educational value
- Revenue tracking and optimization

## 🚀 Deployment

The application is designed for deployment on:
- **Replit Deployments** (primary)
- **Railway**
- **Render**  
- **Heroku**
- Any Node.js hosting platform with PostgreSQL

### Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `NODE_ENV`: production/development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏛 Historical Accuracy

All location data and book recommendations have been carefully researched and verified for historical accuracy. The application serves as both an educational resource and tourism aid, enhancing discovery and appreciation of the Pacific Northwest's rich cultural heritage.

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact the development team
- Review the documentation in `/docs`

---

*Discover the stories that shaped the Pacific Northwest. Explore history, one location at a time.*