# Feedback Collection API Endpoints

## Overview
These endpoints provide Make.com with access to feedback data for automated triage and response workflows.

## Endpoints

### 1. Recent Feedback Webhook
**Purpose**: Trigger Make.com scenarios when new feedback is submitted

**Endpoint**: `GET /api/automation/recent-feedback`
**Method**: GET
**Parameters**: 
- `since` (optional): ISO timestamp, defaults to last 24 hours

**Response**:
```json
{
  "feedback": [
    {
      "id": 123,
      "message": "The Fort Casey page won't load on mobile",
      "email": "user@example.com",
      "locationId": 45,
      "locationName": "Fort Casey",
      "createdAt": "2025-01-10T12:00:00Z",
      "priority": "high",
      "category": "bug",
      "keywords": ["won't load", "mobile"]
    }
  ],
  "count": 1
}
```

### 2. Feedback Categorization
**Purpose**: Automatically categorize feedback for triage

**Endpoint**: `GET /api/automation/feedback-stats`
**Method**: GET

**Response**:
```json
{
  "categories": {
    "bug": 5,
    "feature_request": 12,
    "content_suggestion": 8,
    "praise": 15
  },
  "priority_distribution": {
    "critical": 2,
    "high": 3,
    "medium": 10,
    "low": 25
  },
  "recent_trends": {
    "bugs_last_24h": 2,
    "requests_last_24h": 4
  }
}
```

### 3. Location-Specific Feedback
**Purpose**: Get feedback for specific locations

**Endpoint**: `GET /api/automation/location-feedback/:locationId`
**Method**: GET

**Response**:
```json
{
  "location": {
    "id": 45,
    "name": "Fort Casey"
  },
  "feedback": [
    {
      "id": 123,
      "message": "Great photos but needs more historical context",
      "priority": "medium",
      "category": "content_suggestion",
      "createdAt": "2025-01-10T12:00:00Z"
    }
  ],
  "summary": {
    "total_feedback": 8,
    "avg_sentiment": "positive",
    "common_themes": ["photos", "historical context", "directions"]
  }
}
```

## Make.com Integration Notes

- Use HTTP module to poll `/api/automation/recent-feedback` every 15 minutes
- Set up instant webhooks for critical feedback using the existing `/api/feedback` endpoint
- Use Router module to categorize feedback based on keywords and priority
- Store processed feedback IDs to avoid duplicate processing