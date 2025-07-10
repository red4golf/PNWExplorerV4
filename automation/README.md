# Automation Systems for Pacific Northwest Historical Explorer

This folder contains Make.com automation blueprints and API configurations for beta testing and user acquisition.

## Folder Structure

- `/feedback-collection/` - Beta feedback collection and triage system
- `/location-spotlight/` - Social media location spotlight series
- `/shared/` - Common utilities and configurations

## Prerequisites

1. Make.com account (free tier supports these automations)
2. API endpoints deployed and accessible
3. Social media accounts (Instagram, Twitter, Facebook)
4. Slack workspace for feedback triage
5. Email/SMS services for critical alerts

## Setup Order

1. Deploy API endpoints first
2. Test endpoints with sample data
3. Import Make.com blueprints
4. Configure external service connections
5. Test automations with real data

## API Security

All automation endpoints use the same security as your main application. No additional authentication required for Make.com webhooks since they operate on publicly accessible data.