# Minimal Setup: Feedback Alerts Only (15 minutes)

## What You'll Get
- Instant email alerts when users submit feedback
- No social media setup required
- No Slack workspace needed
- Just basic email notifications

## Option 1: Email Only (Easiest - 5 minutes)

### Step 1: Set Up Make.com Account
1. Go to https://make.com
2. Sign up for free account
3. Skip all the tutorial stuff

### Step 2: Create Simple Email Scenario
1. Click "Create a new scenario"
2. Add "HTTP" module
3. Set URL to: `https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev/api/automation/recent-feedback`
4. Set method to "GET"
5. Add "Email" module
6. Connect to your email account
7. Set email template:
   - To: your@email.com
   - Subject: "New Feedback from PNW History App"
   - Body: "{{1.data.feedback}}"

### Step 3: Schedule and Test
1. Set schedule: Every 30 minutes
2. Click "Run once" to test
3. Activate scenario

## Option 2: Discord Webhook (Also Easy - 10 minutes)

### Step 1: Create Discord Server
1. Create Discord server called "PNW History"
2. Create channel called "feedback"
3. Go to channel settings → Integrations → Webhooks
4. Copy webhook URL

### Step 2: Set Up Make.com
1. Create scenario with HTTP module (same as above)
2. Add Discord webhook module
3. Paste webhook URL
4. Set message: "New feedback: {{1.data.feedback}}"

## Test Your Setup
Run this command to create test feedback:
```bash
curl -X POST "https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev/api/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bug",
    "title": "Test Alert",
    "message": "Testing the notification system",
    "userEmail": "test@example.com"
  }'
```

You should get an email or Discord message within 30 minutes.

## Why This Works
- Your API endpoints are ready and tested
- No complex categorization needed
- Just basic "new feedback received" alerts
- Perfect for beta testing phase

## Later Upgrades
Once this is working, you can add:
- Slack integration
- Smart categorization
- Social media automation

But for now, you'll know immediately when beta users submit feedback.