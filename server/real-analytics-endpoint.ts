import { db } from "./db";
import { sql } from "drizzle-orm";

export async function getRealAnalyticsData() {
  try {
    // Get comprehensive real user statistics
    const basicStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT ip_address) as unique_users,
        COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
        COUNT(CASE WHEN event_type = 'location_view' THEN 1 END) as location_views,
        COUNT(CASE WHEN event_type = 'share_link' THEN 1 END) as shares,
        COUNT(CASE WHEN event_type = 'qr_scan' THEN 1 END) as qr_scans
      FROM user_analytics 
      WHERE is_developer = false
    `);

    // Get user context breakdown (if available)
    const contextData = await db.execute(sql`
      SELECT 
        COALESCE(metadata->>'userContext', 'unknown') as context,
        COUNT(*) as count
      FROM user_analytics 
      WHERE is_developer = false
      GROUP BY metadata->>'userContext'
      ORDER BY count DESC
    `);

    // Get timezone distribution
    const timezoneData = await db.execute(sql`
      SELECT 
        COALESCE(metadata->>'timezone', 'Unknown') as timezone,
        COUNT(*) as count,
        COUNT(DISTINCT ip_address) as unique_users
      FROM user_analytics 
      WHERE is_developer = false AND metadata->>'timezone' IS NOT NULL
      GROUP BY metadata->>'timezone'
      ORDER BY count DESC
      LIMIT 15
    `);

    // Get time patterns
    const timePatterns = await db.execute(sql`
      SELECT 
        CASE 
          WHEN EXTRACT(hour FROM created_at) BETWEEN 6 AND 11 THEN 'morning'
          WHEN EXTRACT(hour FROM created_at) BETWEEN 12 AND 17 THEN 'afternoon'
          WHEN EXTRACT(hour FROM created_at) BETWEEN 18 AND 22 THEN 'evening'
          ELSE 'night'
        END as time_period,
        COUNT(*) as count
      FROM user_analytics 
      WHERE is_developer = false
      GROUP BY time_period
      ORDER BY count DESC
    `);

    // Get day patterns
    const dayPatterns = await db.execute(sql`
      SELECT 
        CASE 
          WHEN EXTRACT(dow FROM created_at) IN (0, 6) THEN 'weekend'
          ELSE 'weekday'
        END as day_type,
        COUNT(*) as count
      FROM user_analytics 
      WHERE is_developer = false
      GROUP BY day_type
    `);

    // Get device type data (if available)
    const deviceData = await db.execute(sql`
      SELECT 
        CASE 
          WHEN metadata->>'deviceType' IS NOT NULL THEN metadata->>'deviceType'
          WHEN metadata->>'screenWidth' IS NOT NULL THEN 
            CASE 
              WHEN CAST(metadata->>'screenWidth' AS INTEGER) <= 768 THEN 'mobile'
              WHEN CAST(metadata->>'screenWidth' AS INTEGER) <= 1024 THEN 'tablet'
              ELSE 'desktop'
            END
          ELSE 'unknown'
        END as device_type,
        COUNT(*) as count
      FROM user_analytics 
      WHERE is_developer = false
      GROUP BY device_type
      ORDER BY count DESC
    `);

    // Get top locations with real views
    const topLocations = await db.execute(sql`
      SELECT 
        ua.location_id,
        l.name as location_name,
        COUNT(*) as view_count,
        COUNT(DISTINCT ua.ip_address) as unique_viewers
      FROM user_analytics ua
      JOIN locations l ON ua.location_id = l.id
      WHERE ua.is_developer = false AND ua.event_type = 'location_view'
      GROUP BY ua.location_id, l.name
      ORDER BY view_count DESC
      LIMIT 15
    `);

    const stats = basicStats.rows[0];
    
    return {
      overview: {
        totalEvents: parseInt(stats.total_events || '0'),
        uniqueUsers: parseInt(stats.unique_users || '0'),
        pageViews: parseInt(stats.page_views || '0'),
        locationViews: parseInt(stats.location_views || '0'),
        shares: parseInt(stats.shares || '0'),
        qrScans: parseInt(stats.qr_scans || '0'),
        engagementRate: stats.unique_users > 0 ? parseFloat((parseInt(stats.total_events) / parseInt(stats.unique_users)).toFixed(2)) : 0,
        locationDiscoveryRate: stats.page_views > 0 ? parseFloat(((parseInt(stats.location_views) / parseInt(stats.page_views)) * 100).toFixed(1)) : 0
      },
      userContext: contextData.rows.reduce((acc: any, row: any) => {
        acc[row.context] = parseInt(row.count);
        return acc;
      }, {}),
      geographic: {
        timezones: timezoneData.rows.map((row: any) => ({
          timezone: row.timezone,
          events: parseInt(row.count),
          users: parseInt(row.unique_users)
        }))
      },
      temporal: {
        timePatterns: timePatterns.rows.reduce((acc: any, row: any) => {
          acc[row.time_period] = parseInt(row.count);
          return acc;
        }, {}),
        dayPatterns: dayPatterns.rows.reduce((acc: any, row: any) => {
          acc[row.day_type] = parseInt(row.count);
          return acc;
        }, {})
      },
      devices: deviceData.rows.reduce((acc: any, row: any) => {
        acc[row.device_type] = parseInt(row.count);
        return acc;
      }, {}),
      topLocations: topLocations.rows.map((row: any) => ({
        locationId: row.location_id,
        locationName: row.location_name,
        viewCount: parseInt(row.view_count),
        uniqueViewers: parseInt(row.unique_viewers)
      })),
      dataQuality: {
        hasContextData: contextData.rows.length > 0,
        hasTimezoneData: timezoneData.rows.length > 0,
        hasDeviceData: deviceData.rows.some((row: any) => row.device_type !== 'unknown')
      }
    };
  } catch (error) {
    throw new Error(`Failed to get real analytics data: ${error}`);
  }
}