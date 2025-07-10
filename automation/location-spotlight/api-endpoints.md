# Location Spotlight API Endpoints

## Overview
These endpoints provide Make.com with location data for automated social media spotlight campaigns.

## Endpoints

### 1. Random Spotlight Location
**Purpose**: Get a random location with complete content for social media spotlight

**Endpoint**: `GET /api/automation/spotlight-location`
**Method**: GET
**Parameters**: None

**Response**:
```json
{
  "location": {
    "id": 45,
    "name": "Fort Casey",
    "description": "Historic coastal defense fort on Whidbey Island",
    "address": "1280 S Fort Casey Rd, Coupeville, WA 98239",
    "category": "Historical Site",
    "period": "1890s-1950s",
    "heroImage": "/api/files/location-45/fort-casey-hero.jpg",
    "story": "Fort Casey was built in the 1890s as part of the Puget Sound defense system...",
    "latitude": 48.1625,
    "longitude": -122.6764
  },
  "photos": [
    {
      "id": 123,
      "filename": "fort-casey-battery.jpg",
      "caption": "Battery Kinzie disappearing gun",
      "url": "/api/files/location-45/fort-casey-battery.jpg"
    }
  ],
  "social_content": {
    "instagram": {
      "caption": "🏛️ Hidden History: Fort Casey\n\nFort Casey was built in the 1890s as part of the Puget Sound defense system...\n\n📍 1280 S Fort Casey Rd, Coupeville, WA 98239\n\n#PNWHistory #HistoricalSite #1890s-1950s",
      "hashtags": ["PNWHistory", "HistoricalSite", "1890s-1950s"]
    },
    "twitter": {
      "tweet": "🏛️ Fort Casey: Fort Casey was built in the 1890s as part of the Puget Sound defense system...\n\nLearn more: [LINK]\n\n#PNWHistory #HistoricalSite",
      "hashtags": ["PNWHistory", "HistoricalSite"]
    },
    "facebook": {
      "post": "Discover the fascinating history of Fort Casey!\n\nFort Casey was built in the 1890s as part of the Puget Sound defense system. This coastal fortress protected the entrance to Puget Sound for over 60 years, featuring innovative disappearing gun technology...\n\nExplore this location and 60+ others in our Pacific Northwest Historical Explorer.",
      "call_to_action": "Learn More"
    }
  },
  "spotlight_date": "2025-01-10T13:15:00Z",
  "app_url": "https://yourapp.com/location/45"
}
```

### 2. Location Analytics for Spotlight Selection
**Purpose**: Get analytics data to inform spotlight selection strategy

**Endpoint**: `GET /api/automation/location-analytics`
**Method**: GET

**Response**:
```json
{
  "total_locations": 83,
  "total_views": 1247,
  "most_popular": [
    {
      "id": 21,
      "name": "Pike Place Market",
      "category": "Cultural Heritage",
      "views": 45,
      "has_photos": true,
      "story_length": 1850
    }
  ],
  "least_popular": [
    {
      "id": 67,
      "name": "Point No Point Lighthouse",
      "category": "Historical Site",
      "views": 2,
      "has_photos": false,
      "story_length": 1200
    }
  ],
  "categories": {
    "Natural Wonder": 28,
    "Historical Site": 35,
    "Cultural Heritage": 20
  },
  "content_completeness": {
    "with_photos": 45,
    "without_photos": 38,
    "rich_stories": 78
  }
}
```

### 3. Specific Location Details
**Purpose**: Get detailed information about a specific location for targeted campaigns

**Endpoint**: `GET /api/locations/:id`
**Method**: GET
**Parameters**: 
- `id` (required): Location ID

**Response**:
```json
{
  "id": 45,
  "name": "Fort Casey",
  "description": "Historic coastal defense fort on Whidbey Island",
  "address": "1280 S Fort Casey Rd, Coupeville, WA 98239",
  "category": "Historical Site",
  "period": "1890s-1950s",
  "latitude": 48.1625,
  "longitude": -122.6764,
  "heroImage": "/api/files/location-45/fort-casey-hero.jpg",
  "story": "Complete markdown-formatted story content...",
  "submitterName": "Research Team",
  "submitterEmail": "research@pnwhistory.org",
  "status": "approved",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### 4. Location Photos
**Purpose**: Get all photos for a specific location

**Endpoint**: `GET /api/locations/:id/photos`
**Method**: GET
**Parameters**: 
- `id` (required): Location ID

**Response**:
```json
[
  {
    "id": 123,
    "filename": "fort-casey-battery.jpg",
    "caption": "Battery Kinzie disappearing gun emplacement",
    "altText": "Historic coastal defense artillery position",
    "url": "/api/files/location-45/fort-casey-battery.jpg",
    "locationId": 45,
    "createdAt": "2025-01-01T12:00:00Z"
  }
]
```

## Make.com Integration Notes

- Use `/api/automation/spotlight-location` for random location selection
- Use `/api/automation/location-analytics` to avoid repeating popular locations
- Store processed location IDs to prevent immediate repeats
- Image URLs are relative - prepend your domain for absolute URLs
- All locations returned have complete stories (500+ characters) and hero images
- Social content is pre-formatted but can be customized
- Use `app_url` field for "Learn More" links in social posts