# Automation Testing Guide

## Overview
This guide helps you test all automation systems to ensure they work correctly before deploying to production.

## API Endpoint Testing

### 1. Feedback Collection APIs

#### Test Recent Feedback
```bash
# Test with no feedback (should return empty array)
curl "http://localhost:5000/api/automation/recent-feedback"

# Test with time parameter
curl "http://localhost:5000/api/automation/recent-feedback?since=2025-01-01T00:00:00Z"
```

#### Test Feedback Stats
```bash
curl "http://localhost:5000/api/automation/feedback-stats"
```

#### Test Location-Specific Feedback
```bash
# Replace 21 with actual location ID
curl "http://localhost:5000/api/automation/location-feedback/21"
```

### 2. Location Spotlight APIs

#### Test Random Spotlight Location
```bash
curl "http://localhost:5000/api/automation/spotlight-location"
```

#### Test Location Analytics
```bash
curl "http://localhost:5000/api/automation/location-analytics"
```

## Sample Data Creation

### Create Test Feedback
```bash
# Create critical feedback
curl -X POST "http://localhost:5000/api/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "The site is completely broken and won'\''t load on mobile",
    "email": "test@example.com",
    "locationId": 21,
    "locationName": "Test Location"
  }'

# Create feature request
curl -X POST "http://localhost:5000/api/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I wish you had more photos of this location",
    "email": "feature@example.com",
    "locationId": 21,
    "locationName": "Test Location"
  }'

# Create praise
curl -X POST "http://localhost:5000/api/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "This app is amazing! I love learning about PNW history",
    "email": "praise@example.com",
    "locationId": 21,
    "locationName": "Test Location"
  }'
```

### Create Test Analytics Events
```bash
# Create location view
curl -X POST "http://localhost:5000/api/analytics" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "location_view",
    "locationId": 21,
    "metadata": {"test": "data"}
  }'

# Create page view
curl -X POST "http://localhost:5000/api/analytics" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "page_view",
    "locationId": null,
    "metadata": {"page": "home"}
  }'
```

## Make.com Testing

### 1. Test Feedback Triage

#### Setup Test Environment
1. Create test Slack workspace
2. Create test channels: `#test-critical`, `#test-bugs`, `#test-features`
3. Get webhook URLs for each channel

#### Test Scenario
1. Submit test feedback (critical, bug, feature request, praise)
2. Wait 15 minutes for polling automation
3. Check Slack channels for categorized messages
4. Verify email notifications sent

### 2. Test Location Spotlight

#### Setup Test Environment
1. Create test social media accounts
2. Connect to Make.com
3. Set up test Google Sheets

#### Test Scenario
1. Run spotlight automation manually
2. Check social media posts created
3. Verify Google Sheets tracking updated
4. Check email notifications sent

## Expected Results

### Feedback Collection
```json
{
  "feedback": [
    {
      "id": 1,
      "message": "The site is completely broken and won't load on mobile",
      "email": "test@example.com",
      "locationId": 21,
      "locationName": "Test Location",
      "createdAt": "2025-01-10T13:00:00Z",
      "priority": "high",
      "category": "bug",
      "keywords": ["bug"]
    }
  ],
  "count": 1
}
```

### Feedback Stats
```json
{
  "categories": {
    "bug": 1,
    "feature_request": 1,
    "content_suggestion": 0,
    "praise": 1
  },
  "priority_distribution": {
    "critical": 0,
    "high": 1,
    "medium": 0,
    "low": 2
  },
  "recent_trends": {
    "bugs_last_24h": 1,
    "requests_last_24h": 1
  }
}
```

### Location Spotlight
```json
{
  "location": {
    "id": 21,
    "name": "Japanese American Exclusion Memorial",
    "description": "Memorial commemorating Japanese American internment",
    "address": "1675 Alaskan Way, Seattle, WA 98101",
    "category": "Memorial Site",
    "period": "1940s",
    "heroImage": null,
    "story": null,
    "latitude": 47.6062,
    "longitude": -122.3321
  },
  "photos": [],
  "social_content": {
    "instagram": {
      "caption": "🏛️ Hidden History: Japanese American Exclusion Memorial\n\nMemorial commemorating Japanese American internment\n\n📍 1675 Alaskan Way, Seattle, WA 98101\n\n#PNWHistory #MemorialSite #1940s",
      "hashtags": ["PNWHistory", "MemorialSite", "1940s"]
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. API Returns Empty Results
**Problem**: `/api/automation/recent-feedback` returns `{"feedback":[],"count":0}`
**Solution**: 
- Create test feedback using the curl commands above
- Check that feedback was created: `curl http://localhost:5000/api/admin/feedback`

#### 2. Spotlight Location Not Available
**Problem**: `/api/automation/spotlight-location` returns `{"message":"No locations available for spotlight"}`
**Solution**: 
- Check that locations exist: `curl http://localhost:5000/api/locations`
- Verify locations have descriptions
- Check database for approved locations

#### 3. Make.com Scenario Fails
**Problem**: Make.com scenarios return errors
**Solution**: 
- Test API endpoints manually first
- Check Make.com execution logs
- Verify webhook URLs are correct
- Test with sample data

#### 4. Social Media Posts Fail
**Problem**: Social media modules in Make.com fail
**Solution**: 
- Verify social media accounts connected
- Check posting permissions
- Test image URLs are accessible
- Verify account limits not exceeded

## Performance Testing

### Load Testing
```bash
# Test API endpoints under load
for i in {1..10}; do
  curl "http://localhost:5000/api/automation/recent-feedback" &
done
wait

# Test spotlight location multiple times
for i in {1..5}; do
  curl "http://localhost:5000/api/automation/spotlight-location"
done
```

### Timing Tests
```bash
# Test response times
time curl "http://localhost:5000/api/automation/recent-feedback"
time curl "http://localhost:5000/api/automation/spotlight-location"
time curl "http://localhost:5000/api/automation/location-analytics"
```

## Success Criteria

### Feedback Collection
- [ ] Recent feedback API returns categorized feedback
- [ ] Feedback stats API returns category breakdown
- [ ] Location-specific feedback API works
- [ ] Make.com receives and processes feedback correctly
- [ ] Critical alerts trigger immediately
- [ ] User acknowledgment emails sent

### Location Spotlight
- [ ] Random location API returns valid location data
- [ ] Social media content is properly formatted
- [ ] Make.com creates social media posts
- [ ] Tracking spreadsheet updates correctly
- [ ] Email notifications sent to admin

### System Performance
- [ ] All APIs respond within 2 seconds
- [ ] Make.com scenarios complete without errors
- [ ] No data loss during automation
- [ ] Error handling works for edge cases
- [ ] System remains stable under load

## Monitoring Setup

### Health Checks
```bash
# Create health check script
cat > check_automation_health.sh << 'EOF'
#!/bin/bash
echo "Checking automation health..."

# Test feedback API
feedback_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/api/automation/recent-feedback")
echo "Feedback API: $feedback_status"

# Test spotlight API
spotlight_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/api/automation/spotlight-location")
echo "Spotlight API: $spotlight_status"

# Test analytics API
analytics_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/api/automation/location-analytics")
echo "Analytics API: $analytics_status"

if [ "$feedback_status" = "200" ] && [ "$spotlight_status" = "200" ] && [ "$analytics_status" = "200" ]; then
    echo "✅ All automation APIs healthy"
    exit 0
else
    echo "❌ Some automation APIs failing"
    exit 1
fi
EOF

chmod +x check_automation_health.sh
./check_automation_health.sh
```

### Continuous Monitoring
1. Set up cron job to run health checks every 5 minutes
2. Monitor Make.com execution logs daily
3. Track social media engagement metrics
4. Monitor feedback response times
5. Set up alerts for automation failures