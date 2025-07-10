# Corrected Email Template for Make.com

## The Issue
The API returns data directly as `{"feedback": [...], "count": 4}`, not nested under `data`.

## Correct Email Template

### Email Subject:
```
New Feedback - PNW History App
```

### Email Content:
```
New feedback received from Pacific Northwest Historical Explorer:

{{range(1.feedback)}}
---
Message: {{message}}
Email: {{userEmail}}
Category: {{category}}
Priority: {{priority}}
Location ID: {{locationId}}
Time: {{createdAt}}
---
{{/range}}

Total feedback items: {{1.count}}

View all feedback: https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev/admin
```

## Simple Version (If Range Doesn't Work)
If the range function is complicated, use this simpler version:

### Email Content (Simple):
```
New feedback received from Pacific Northwest Historical Explorer:

Feedback Data:
{{1.feedback}}

Total Count: {{1.count}}

View admin panel: https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev/admin
```

## Test Data Available
Current feedback in system:
- 4 total feedback items
- Mix of bug reports, features, and praise
- Ready to test your email notification

## Make.com Setup
1. HTTP module URL: `https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev/api/automation/recent-feedback`
2. Email module with corrected template above
3. Schedule every 30 minutes
4. Test and activate