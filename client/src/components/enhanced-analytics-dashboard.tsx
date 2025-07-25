import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Chrome, 
  Search,
  MousePointer,
  Clock,
  TrendingUp,
  Eye,
  Share2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsStats {
  totalEvents: number;
  qrScans: number;
  shareLinks: number;
  locationViews: number;
  uniqueUsers: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  browserBreakdown: {
    Chrome: number;
    Firefox: number;
    Safari: number;
    Edge: number;
    Unknown: number;
  };
  topEvents: Array<{
    eventType: string;
    count: number;
  }>;
  dailyStats: Array<{
    date: string;
    events: number;
    users: number;
  }>;
  searchTerms: Array<{
    term: string;
    count: number;
  }>;
  topLocations: Array<{
    id: number;
    name: string;
    views: number;
  }>;
}

export function EnhancedAnalyticsDashboard() {
  const { data: analyticsStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/analytics/enhanced-stats"],
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center text-gray-500">Loading enhanced analytics...</div>
      </div>
    );
  }

  const stats = analyticsStats as AnalyticsStats;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-900">Total Events</h4>
            </div>
            <p className="text-2xl font-bold text-blue-700">{stats?.totalEvents || 0}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              All interactions
            </Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-900">Unique Users</h4>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats?.uniqueUsers || 0}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              IP-based tracking
            </Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Eye className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-semibold text-purple-900">Location Views</h4>
            </div>
            <p className="text-2xl font-bold text-purple-700">{stats?.locationViews || 0}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              Story engagement
            </Badge>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Share2 className="w-5 h-5 text-orange-600 mr-2" />
              <h4 className="font-semibold text-orange-900">Shares</h4>
            </div>
            <p className="text-2xl font-bold text-orange-700">{stats?.shareLinks || 0}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              Social sharing
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Device & Browser Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-heritage-brown">
              <Smartphone className="w-5 h-5 mr-2" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Smartphone className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Mobile</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">{stats?.deviceBreakdown?.mobile || 0}</span>
                  <Badge variant="secondary">
                    {stats?.totalEvents ? Math.round((stats.deviceBreakdown?.mobile || 0) / stats.totalEvents * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Monitor className="w-4 h-4 mr-2 text-green-600" />
                  <span>Desktop</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">{stats?.deviceBreakdown?.desktop || 0}</span>
                  <Badge variant="secondary">
                    {stats?.totalEvents ? Math.round((stats.deviceBreakdown?.desktop || 0) / stats.totalEvents * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Tablet className="w-4 h-4 mr-2 text-purple-600" />
                  <span>Tablet</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">{stats?.deviceBreakdown?.tablet || 0}</span>
                  <Badge variant="secondary">
                    {stats?.totalEvents ? Math.round((stats.deviceBreakdown?.tablet || 0) / stats.totalEvents * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-heritage-brown">
              <Chrome className="w-5 h-5 mr-2" />
              Browser Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats?.browserBreakdown || {}).map(([browser, count]) => (
                <div key={browser} className="flex items-center justify-between">
                  <span>{browser}</span>
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">{count}</span>
                    <Badge variant="secondary">
                      {stats?.totalEvents ? Math.round((count as number) / stats.totalEvents * 100) : 0}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Locations & Search Terms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-heritage-brown">
              <Eye className="w-5 h-5 mr-2" />
              Most Popular Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.topLocations?.slice(0, 5).map((location, index) => (
                <div key={location.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">#{index + 1}</Badge>
                    <span className="text-sm font-medium">{location.name}</span>
                  </div>
                  <Badge variant="secondary">{location.views} views</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-heritage-brown">
              <Search className="w-5 h-5 mr-2" />
              Popular Search Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.searchTerms?.slice(0, 5).map((term, index) => (
                <div key={term.term} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">#{index + 1}</Badge>
                    <span className="text-sm font-medium">"{term.term}"</span>
                  </div>
                  <Badge variant="secondary">{term.count} searches</Badge>
                </div>
              )) || (
                <div className="text-center text-gray-500 py-4">
                  No search data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-heritage-brown">
            <MousePointer className="w-5 h-5 mr-2" />
            User Interaction Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats?.topEvents?.map((event) => (
              <div key={event.eventType} className="text-center p-3 bg-gray-50 rounded">
                <div className="font-semibold text-lg">{event.count}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {event.eventType.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}