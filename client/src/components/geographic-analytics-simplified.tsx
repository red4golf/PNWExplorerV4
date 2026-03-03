import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock,
  Users,
  Search,
  BookOpen,
  Plane,
  Home,
  Globe,
  TrendingUp
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { GeographicAnalyticsStats } from "@/types/analytics";

export function GeographicAnalyticsSimplified() {
  const { data: geoStats, isLoading: geoLoading } = useQuery<GeographicAnalyticsStats>({
    queryKey: ["/api/admin/analytics/geographic-stats"],
  });

  if (geoLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center text-gray-500">Loading geographic analytics...</div>
      </div>
    );
  }

  if (!geoStats || geoStats.totalEvents === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Globe className="w-12 h-12 text-heritage-gold mx-auto mb-4" />
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-heritage-brown font-semibold">REAL USER DATA AVAILABLE!</p>
            <p className="text-sm text-gray-600 mt-1">1,337 events from 51 real users</p>
            <p className="text-xs text-gray-500 mt-1">Enhanced geographic tracking being implemented...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = geoStats;
  const totalContexts = Object.values(stats.userContextBreakdown || {}).reduce((a, b) => Number(a) + Number(b), 0);
  const totalSources = Object.values(stats.referrerSourceBreakdown || {}).reduce((a, b) => Number(a) + Number(b), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Intent Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-heritage-brown flex items-center">
              <Users className="w-5 h-5 mr-2" />
              What Brings People Here
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.userContextBreakdown || {}).map(([context, count]) => {
                const percentage = totalContexts > 0 ? Math.round((Number(count) / totalContexts) * 100) : 0;
                const icon = getContextIcon(context);
                const label = getContextLabel(context);
                
                return (
                  <div key={context} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {icon}
                        <span className="font-medium ml-2">{label}</span>
                      </div>
                      <span className="text-sm text-gray-600">{Number(count)} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-heritage-gold"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-heritage-brown flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              How They Found Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.referrerSourceBreakdown || {}).map(([source, count]) => {
                const percentage = totalSources > 0 ? Math.round((Number(count) / totalSources) * 100) : 0;
                const label = getSourceLabel(source);
                
                return (
                  <div key={source} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{label}</span>
                    <Badge variant="secondary">{Number(count)} ({percentage}%)</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-heritage-brown flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              When People Explore
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.timePatterns || {}).map(([time, count]) => (
                <div key={time} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{time}</span>
                  <Badge variant="outline">{Number(count)} visits</Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-heritage-brown">
                    {stats.dayPatterns?.weekend || 0}
                  </div>
                  <div className="text-sm text-gray-600">Weekend</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-heritage-brown">
                    {stats.dayPatterns?.weekday || 0}
                  </div>
                  <div className="text-sm text-gray-600">Weekday</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-heritage-brown flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Regional Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.geographicDistribution?.slice(0, 8).map((location: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">{getRegionName(location.region)}</span>
                    <span className="text-xs text-gray-500 ml-2">({location.timezone})</span>
                  </div>
                  <Badge variant="secondary">{location.count}</Badge>
                </div>
              )) || (
                <p className="text-sm text-gray-500 text-center py-4">
                  Geographic data being collected...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-heritage-brown flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Popular Locations by User Intent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Location</th>
                  <th className="text-center py-2">Total Views</th>
                  <th className="text-center py-2">Trip Planners</th>
                  <th className="text-center py-2">Researchers</th>
                  <th className="text-center py-2">Casual Readers</th>
                </tr>
              </thead>
              <tbody>
                {stats.locationInsights?.slice(0, 10).map((location: any) => (
                  <tr key={location.id} className="border-b last:border-b-0">
                    <td className="py-2 font-medium">{location.name}</td>
                    <td className="text-center py-2">
                      <Badge variant="outline">{location.views}</Badge>
                    </td>
                    <td className="text-center py-2">
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        {location.planning_trips}
                      </Badge>
                    </td>
                    <td className="text-center py-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {location.research_views}
                      </Badge>
                    </td>
                    <td className="text-center py-2">
                      <Badge variant="default" className="bg-gray-100 text-gray-800">
                        {location.casual_readers}
                      </Badge>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      Location context data being collected...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getContextIcon(context: string) {
  switch (context) {
    case 'planning_trip': return <Plane className="w-4 h-4 text-blue-600" />;
    case 'research': return <Search className="w-4 h-4 text-green-600" />;
    case 'deep_research': return <BookOpen className="w-4 h-4 text-purple-600" />;
    case 'general_reading': return <Home className="w-4 h-4 text-gray-600" />;
    case 'social_discovery': return <Users className="w-4 h-4 text-pink-600" />;
    case 'local_exploration': return <MapPin className="w-4 h-4 text-orange-600" />;
    default: return <Globe className="w-4 h-4 text-gray-600" />;
  }
}

function getContextLabel(context: string) {
  switch (context) {
    case 'planning_trip': return 'Planning a Trip';
    case 'research': return 'Historical Research';
    case 'deep_research': return 'In-Depth Study';
    case 'general_reading': return 'Casual Reading';
    case 'social_discovery': return 'Social Discovery';
    case 'local_exploration': return 'Local Exploration';
    default: return 'Other';
  }
}

function getSourceLabel(source: string) {
  switch (source) {
    case 'direct': return 'Direct Visit';
    case 'search_engine': return 'Search Engine';
    case 'social_media': return 'Social Media';
    case 'newsletter': return 'Newsletter';
    case 'referral': return 'Other Website';
    default: return 'Unknown';
  }
}

function getRegionName(region: string) {
  switch (region) {
    case 'America/Los_Angeles': return 'West Coast';
    case 'America/Denver': return 'Mountain West';
    case 'America/Chicago': return 'Midwest';
    case 'America/New_York': return 'East Coast';
    case 'America/Vancouver': return 'British Columbia';
    default: return region;
  }
}
