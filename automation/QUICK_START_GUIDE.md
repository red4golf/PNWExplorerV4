# Quick Start: Make.com Setup (30 minutes)

## Your App Details
- **App URL**: `https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev`
- **API Endpoints Ready**: All 5 automation endpoints are live and tested

## Step 1: Create Make.com Account (5 minutes)
1. Go to https://make.com
2. Sign up for free account
3. Verify email
4. You get 1,000 operations/month free (perfect for beta testing)

## Step 2: Set Up Slack Workspace (10 minutes)
1. Create Slack workspace: "PNW History Team"
2. Create these channels:
   - `#critical-bugs` (urgent issues)
   - `#bug-reports` (general bugs) 
   - `#feature-requests` (user suggestions)
   - `#praise` (positive feedback)

3. Get webhook URLs for each channel:
   - Go to each channel → Settings → Integrations → Add Incoming Webhook
   - Copy webhook URL for each channel

## Step 3: Import First Scenario (5 minutes)
1. In Make.com, click "Create a new scenario"
2. Click "Import Blueprint" 
3. Copy this JSON and paste it:

```json
{
  "name": "PNW History - Feedback Triage",
  "scenario": {
    "dstOffset": 0,
    "modules": [
      {
        "id": 1,
        "module": "http:ActionSendData",
        "version": 1,
        "parameters": {
          "url": "https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev/api/automation/recent-feedback",
          "method": "GET",
          "headers": [],
          "qs": []
        },
        "mapper": {},
        "metadata": {
          "designer": {
            "x": 0,
            "y": 0
          }
        }
      },
      {
        "id": 2,
        "module": "builtin:BasicRouter",
        "version": 1,
        "parameters": {},
        "mapper": {
          "array": "{{1.data.feedback}}"
        },
        "metadata": {
          "designer": {
            "x": 300,
            "y": 0
          }
        }
      },
      {
        "id": 3,
        "module": "slack:ActionPostMessage",
        "version": 1,
        "parameters": {
          "channel": "bug-reports"
        },
        "mapper": {
          "text": "🐛 Bug Report\n\nMessage: {{2.message}}\nEmail: {{2.userEmail}}\nPriority: {{2.priority}}\nLocation: {{2.locationName}}\n\nPlease investigate."
        },
        "metadata": {
          "designer": {
            "x": 600,
            "y": 0
          }
        },
        "filter": {
          "name": "Bug Category",
          "conditions": [
            {
              "a": "{{2.category}}",
              "b": "bug",
              "o": "text:equal"
            }
          ]
        }
      },
      {
        "id": 4,
        "module": "slack:ActionPostMessage",
        "version": 1,
        "parameters": {
          "channel": "feature-requests"
        },
        "mapper": {
          "text": "💡 Feature Request\n\nMessage: {{2.message}}\nEmail: {{2.userEmail}}\nLocation: {{2.locationName}}\n\nUser suggestion received."
        },
        "metadata": {
          "designer": {
            "x": 600,
            "y": 150
          }
        },
        "filter": {
          "name": "Feature Category",
          "conditions": [
            {
              "a": "{{2.category}}",
              "b": "feature_request",
              "o": "text:equal"
            }
          ]
        }
      },
      {
        "id": 5,
        "module": "slack:ActionPostMessage",
        "version": 1,
        "parameters": {
          "channel": "praise"
        },
        "mapper": {
          "text": "🎉 Positive Feedback\n\nMessage: {{2.message}}\nEmail: {{2.userEmail}}\nLocation: {{2.locationName}}\n\nUser loves the app!"
        },
        "metadata": {
          "designer": {
            "x": 600,
            "y": 300
          }
        },
        "filter": {
          "name": "Praise Category",
          "conditions": [
            {
              "a": "{{2.category}}",
              "b": "praise",
              "o": "text:equal"
            }
          ]
        }
      }
    ]
  }
}
```

## Step 4: Configure Slack Connection (5 minutes)
1. Click on each Slack module (modules 3, 4, 5)
2. Click "Add" next to Slack connection
3. Sign in to your Slack workspace
4. Configure each module:
   - Module 3: Select `#bug-reports` channel
   - Module 4: Select `#feature-requests` channel  
   - Module 5: Select `#praise` channel

## Step 5: Test the System (5 minutes)
1. Click "Run once" in Make.com
2. Check if it runs without errors
3. Set schedule: Every 15 minutes
4. Save and activate scenario

## Test with Real Feedback
Run this command to create test feedback:
```bash
curl -X POST "https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev/api/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bug",
    "title": "Test Bug Report",
    "message": "This is a test bug to verify Make.com integration",
    "userEmail": "test@example.com",
    "locationId": 21
  }'
```

## What Should Happen
1. Make.com runs every 15 minutes
2. Finds new feedback in your app
3. Categorizes it automatically
4. Posts to appropriate Slack channel
5. You get notifications in Slack

## Social Media Setup (Later)
Once feedback triage is working, we can set up:
- Instagram business account connection
- Twitter API access
- Facebook page integration
- Weekly location spotlight posts

## Need Help?
- Test API endpoint: `https://3b04f476-ae81-4ed3-8be1-8a686cc097f7-00-w9co9q8683im.spock.replit.dev/api/automation/recent-feedback`
- Should return JSON with feedback data
- Reference: `automation/SETUP_GUIDE.md` for detailed instructions

## Success Indicators
- [ ] Make.com scenario runs without errors
- [ ] Feedback appears in correct Slack channels
- [ ] Categories are detected correctly (bug, feature, praise)
- [ ] You receive Slack notifications

Start with this feedback triage system first. Once it's working, we'll add the social media automation.