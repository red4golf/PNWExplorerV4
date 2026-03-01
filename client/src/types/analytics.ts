export interface TopLocation {
  locationId: number;
  locationName: string;
  count: number;
}

export interface BasicAnalyticsStats {
  totalEvents: number;
  uniqueUsers: number;
  pageViews?: number;
  locationViews?: number;
  qrScans?: number;
  shareLinks?: number;
  topLocations?: TopLocation[];
}

export interface GeoAnalyticsLocation {
  region: string;
  timezone: string;
  count: number;
}

export interface GeoAnalyticsInsight {
  id: number;
  name: string;
  views: number;
  planning_trips: number;
  research_views: number;
  casual_readers: number;
}

export interface GeographicAnalyticsStats {
  totalEvents: number;
  userContextBreakdown?: Record<string, number>;
  referrerSourceBreakdown?: Record<string, number>;
  timePatterns?: Record<string, number>;
  dayPatterns?: { weekend?: number; weekday?: number };
  geographicDistribution?: GeoAnalyticsLocation[];
  locationInsights?: GeoAnalyticsInsight[];
}
