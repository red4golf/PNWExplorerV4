# Email Alert Setup - 5 Minutes

## Step 1: Create Make.com Account (2 minutes)
1. Go to https://make.com
2. Click "Sign up for free"
3. Use your email and create password
4. Skip the tutorial popup

## Step 2: Create Email Alert Scenario (3 minutes)

### Create New Scenario
1. Click "Create a new scenario"
2. In the module library, search for "HTTP"
3. Click "HTTP" and select "Make a request"

### Configure HTTP Module
1. Set URL to: `https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev/api/automation/recent-feedback`
2. Set Method to "GET"
3. Leave headers empty
4. Click "OK"

### Add Email Module
1. Click the "+" button after HTTP module
2. Search for "Email"
3. Select "Email" → "Send an Email"
4. Connect your email account (Gmail, Outlook, etc.)

### Configure Email Template
**To:** your@email.com
**Subject:** New Feedback - PNW History App
**Content:**
```
New feedback received from Pacific Northwest Historical Explorer:

{{range(1.feedback)}}
---
Message: {{message}}
Email: {{userEmail}}
Category: {{category}}
Priority: {{priority}}
Location: {{locationName}}
Time: {{createdAt}}
---
{{/range}}

Total feedback items: {{1.count}}

View all feedback: https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev/admin
```

### Set Schedule
1. Click the clock icon at the top
2. Select "Every 30 minutes"
3. Click "OK"

### Test and Activate
1. Click "Run once" to test
2. Check your email for a test message
3. Click "ON" to activate the scenario

## What You'll Get
- Email every 30 minutes if there's new feedback
- All feedback details in one organized email
- Zero configuration maintenance required
- Works immediately for your beta launch

## Test It Works
I'll create a test feedback entry now so you can see the email notification: