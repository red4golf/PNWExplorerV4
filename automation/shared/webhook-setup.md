# Webhook Setup Guide

## Overview
This guide helps you set up webhooks for instant automation triggers, particularly for critical feedback alerts.

## 1. Make.com Webhook Configuration

### Create Webhook in Make.com
1. Go to Make.com dashboard
2. Create new scenario
3. Add "Webhooks" > "Custom Webhook" as first module
4. Click "Add" to create new webhook
5. Copy the webhook URL (e.g., `https://hook.make.com/abc123xyz`)

### Configure Webhook Settings
- **Method**: POST
- **Data structure**: JSON
- **Headers**: Content-Type: application/json

## 2. Integration with Your App

### Option A: Direct Integration (Recommended for Critical Alerts)
Add webhook calls to your existing feedback submission endpoint:

```javascript
// In your feedback submission route
app.post("/api/feedback", async (req, res) => {
  try {
    // Existing feedback creation code
    const feedback = await storage.createFeedback(feedbackData);
    
    // Trigger webhook for critical issues
    if (isCriticalFeedback(feedback.message)) {
      await triggerWebhook(feedback);
    }
    
    res.json(feedback);
  } catch (error) {
    // Error handling
  }
});

function isCriticalFeedback(message) {
  const criticalKeywords = ['broken', 'crashed', 'down', 'server error', 'won\'t load'];
  return criticalKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

async function triggerWebhook(feedback) {
  try {
    await fetch('YOUR_WEBHOOK_URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priority: 'critical',
        locationName: feedback.locationName,
        message: feedback.message,
        email: feedback.email,
        createdAt: feedback.createdAt,
        keywords: extractKeywords(feedback.message)
      })
    });
  } catch (error) {
    console.error('Webhook trigger failed:', error);
  }
}
```

### Option B: Polling Integration (Less Immediate)
Use the existing `/api/automation/recent-feedback` endpoint with Make.com polling every 5-15 minutes.

## 3. Testing Webhooks

### Test Payload
```json
{
  "priority": "critical",
  "locationName": "Test Location",
  "message": "The site is completely broken and won't load",
  "email": "test@example.com",
  "createdAt": "2025-01-10T13:00:00Z",
  "keywords": ["broken", "won't load"]
}
```

### Test Steps
1. Use webhook URL in browser or Postman
2. Send POST request with test payload
3. Verify Make.com scenario triggers
4. Check SMS/email/Slack notifications work
5. Monitor Make.com execution logs

## 4. Webhook Security

### Basic Security Measures
- Use HTTPS only
- Don't expose webhook URLs publicly
- Consider IP whitelisting (Make.com IPs)
- Add basic authentication headers if needed

### Advanced Security (Optional)
- Implement webhook signature verification
- Add rate limiting
- Use environment variables for webhook URLs

## 5. Webhook URLs by Automation Type

### Critical Feedback Alerts
- **Purpose**: Instant notifications for critical issues
- **Trigger**: Feedback contains critical keywords
- **Response**: SMS + Email + Slack alerts

### New Feedback Triage
- **Purpose**: Route all feedback to appropriate channels
- **Trigger**: Any new feedback submission
- **Response**: Categorized Slack messages + user confirmation emails

### Location Analytics Updates
- **Purpose**: Track location popularity changes
- **Trigger**: Daily/weekly analytics updates
- **Response**: Update spotlight rotation priority

## 6. Monitoring and Troubleshooting

### Common Issues
- **Webhook not triggering**: Check URL, HTTP method, payload format
- **Missing data**: Verify JSON structure matches Make.com expectations
- **Rate limits**: Implement retry logic with exponential backoff
- **Authentication errors**: Check API keys and permissions

### Monitoring Tools
- Make.com execution logs
- Your app's server logs
- Webhook delivery status
- Error rate monitoring

## 7. Backup Systems

### Failover Options
- If webhook fails, fall back to polling
- Store failed webhook attempts for retry
- Email alerts if webhook system is down
- Manual backup notification system

### Health Checks
- Daily webhook health verification
- Monitor webhook response times
- Track webhook success/failure rates
- Alert when webhook system is degraded