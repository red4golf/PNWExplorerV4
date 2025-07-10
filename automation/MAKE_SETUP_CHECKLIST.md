# Make.com Setup Checklist

## Prerequisites (5 minutes)
- [ ] Create free Make.com account at https://make.com
- [ ] Verify email and complete account setup
- [ ] Note your app URL: `https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev`

## Step 1: Social Media Account Setup (10 minutes)
### Instagram Business Account
- [ ] Convert personal Instagram to business account
- [ ] Connect to Facebook Page (required for automation)
- [ ] Note Instagram handle: `@pnw_historical_explorer`

### Twitter/X Account
- [ ] Create Twitter account: `@PNWHistoryApp`
- [ ] Apply for Twitter API access (may take 24-48 hours)
- [ ] Generate API keys and tokens

### Facebook Page
- [ ] Create Facebook Page: "Pacific Northwest Historical Explorer"
- [ ] Set up as "Education" category page
- [ ] Add page description and cover photo

## Step 2: Slack Workspace Setup (5 minutes)
- [ ] Create Slack workspace: "PNW History Team"
- [ ] Create channels:
  - [ ] `#critical-bugs` - Urgent issues requiring immediate attention
  - [ ] `#bug-reports` - General bug reports and issues
  - [ ] `#feature-requests` - User suggestions and feature requests
  - [ ] `#praise` - Positive feedback and testimonials
- [ ] Create incoming webhooks for each channel
- [ ] Note webhook URLs for Make.com configuration

## Step 3: Import Make.com Scenarios (10 minutes)
### Feedback Collection System
- [ ] Import `feedback-collection/make-blueprints.json`
- [ ] Configure webhook URLs for each Slack channel
- [ ] Set your app URL in HTTP requests
- [ ] Test with sample feedback

### Location Spotlight System
- [ ] Import `location-spotlight/make-blueprints.json`
- [ ] Connect social media accounts
- [ ] Set posting schedule (Tuesday 10 AM)
- [ ] Test location spotlight generation

## Step 4: Configuration Details

### Replace These Values in Make.com:
```
YOUR_APP_URL → https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev
YOUR_SLACK_WEBHOOK_CRITICAL → [from #critical-bugs channel]
YOUR_SLACK_WEBHOOK_BUGS → [from #bug-reports channel]
YOUR_SLACK_WEBHOOK_FEATURES → [from #feature-requests channel]
YOUR_SLACK_WEBHOOK_PRAISE → [from #praise channel]
YOUR_EMAIL → [your notification email]
YOUR_PHONE → [your SMS number for critical alerts]
```

### API Endpoints to Configure:
- Feedback Collection: `GET /api/automation/recent-feedback`
- Feedback Stats: `GET /api/automation/feedback-stats`
- Location Spotlight: `GET /api/automation/spotlight-location`
- Location Analytics: `GET /api/automation/location-analytics`

## Step 5: Test Each System (15 minutes)
### Test Feedback Collection
- [ ] Submit test feedback via your app
- [ ] Wait 2 minutes for Make.com to process
- [ ] Check Slack channels for categorized messages
- [ ] Verify email notifications received

### Test Location Spotlight
- [ ] Run scenario manually in Make.com
- [ ] Check social media posts created
- [ ] Verify content quality and formatting
- [ ] Confirm analytics tracking

## Step 6: Schedule Automation (5 minutes)
### Set Up Recurring Schedules:
- [ ] Feedback monitoring: Every 15 minutes
- [ ] Location spotlight: Tuesday 10 AM weekly
- [ ] Popular location boost: Friday 3 PM weekly
- [ ] Hidden gem promotion: Thursday 2 PM weekly
- [ ] Weekly digest: Sunday 9 AM weekly

## Troubleshooting Checklist
- [ ] All webhook URLs are correct and active
- [ ] Social media accounts have posting permissions
- [ ] App URL is accessible from Make.com
- [ ] API endpoints return valid JSON responses
- [ ] Slack notifications are working in all channels

## Success Verification
- [ ] Feedback automatically categorized and routed
- [ ] Critical bugs trigger instant alerts
- [ ] Social media posts created with proper formatting
- [ ] Analytics data flowing correctly
- [ ] All scenarios running without errors

## Next Steps After Setup
1. Monitor first week of automation
2. Adjust posting schedules based on engagement
3. Fine-tune feedback categorization rules
4. Set up analytics dashboards
5. Create backup notification methods

---
**Estimated Total Setup Time: 45 minutes**
**Support**: Reference automation/SETUP_GUIDE.md for detailed instructions