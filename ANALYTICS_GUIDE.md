# Analytics System Guide

## Overview
The Pacific Northwest Historical Explorer uses anonymous analytics to understand user engagement and improve the educational experience. This guide covers the analytics implementation, privacy protections, and data usage.

## Privacy-First Design

### What We Track (Anonymous)
- **Page Views**: Which pages users visit to optimize content
- **Location Views**: Most popular historical sites for content prioritization  
- **Geographic Regions**: Timezone-based distribution (no precise locations)
- **Affiliate Clicks**: Book recommendation performance for revenue insights
- **User Flow**: Navigation patterns to improve user experience

### What We DON'T Track
- Individual user identification or personal information
- Precise location data or IP addresses
- Browsing history outside the application
- Device fingerprinting or persistent tracking
- Cross-site tracking or third-party data sharing

## Developer Exclusion System

### Automatic Exclusion
The system automatically excludes tracking for:
- **Admin users** (logged into admin panel)
- **Development domains** (replit.dev, localhost)
- **Development environments** (auto-detected)

### Manual Exclusion
Any user can exclude themselves by running in browser console:
```javascript
localStorage.setItem('dev-mode', 'true')
```

### Verification
When excluded, you'll see console messages:
```
🔍 Developer mode - skipping analytics: page_view
```

## Data Reset Protocol

### Fresh Start for Beta Launch
- Analytics data reset to 0 on January 2025
- Ensures authentic user data collection
- Removes all development/testing activity

### Reset Commands (Admin Only)
```sql
DELETE FROM user_analytics;
DELETE FROM affiliate_clicks;
```

## Analytics Dashboard

### Admin Analytics Features
- **Raw Data Facts**: Only confirmed database counts
- **Geographic Distribution**: Anonymous timezone-based insights
- **Location Performance**: Most viewed historical sites
- **Affiliate Performance**: Book recommendation click tracking
- **Traffic Sources**: UTM parameter tracking for marketing

### Honest Reporting
- No synthetic data or artificial visualizations
- Clear warnings about missing data
- Explicit distinction between confirmed facts and assumptions
- Transparent about data limitations

## Legal Compliance

### GDPR/CCPA Compliance
- No personal data collection requiring consent
- Anonymous aggregated data only
- Right to be forgotten: automatically anonymous
- Data minimization: only essential metrics collected

### Transparency
- Open source analytics implementation
- Clear documentation of data collection
- User control over tracking participation
- No hidden or deceptive practices

## Revenue Analytics

### Amazon Associates Tracking
- Anonymous affiliate click monitoring
- Book recommendation performance metrics
- Revenue attribution without personal data
- Geographic performance insights

### Ethical Monetization
- Clear disclosure of affiliate relationships
- Relevant book recommendations only
- Educational value prioritized over revenue
- Transparent about commercial aspects

## Data Usage

### Content Optimization
- Identify most popular historical locations
- Understand user navigation patterns
- Optimize mobile vs desktop experience
- Prioritize content development

### Educational Impact
- Measure engagement with historical content
- Track learning resource utilization
- Assess geographic reach of educational mission
- Guide expansion to new regions

## Technical Implementation

### Client-Side Tracking
- Minimal JavaScript footprint
- No third-party tracking libraries
- Browser-native APIs only
- Respect Do Not Track preferences

### Server-Side Processing
- PostgreSQL database storage
- Secure API endpoints
- Admin-only access controls
- Regular data cleanup

## Future Enhancements

### Planned Features
- Enhanced geographic insights (still anonymous)
- Better mobile/desktop usage breakdown
- Seasonal tourism pattern analysis
- Educational institution partnership metrics

### Continued Privacy Focus
- Regular privacy review cycles
- User feedback integration
- Industry best practice adoption
- Regulatory compliance monitoring

---

*Last Updated: January 2025*
*For questions about analytics or privacy, contact the development team.*