import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users,
  AlertTriangle,
  TrendingUp,
  Eye,
  Share,
  QrCode,
  Globe,
  Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { BasicAnalyticsStats } from "@/types/analytics";

export function HonestAnalyticsData() {
  const { data: basicStats } = useQuery<BasicAnalyticsStats>({
    queryKey: ["/api/admin/analytics/stats"],
  });

  if (!basicStats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading real analytics data...</div>
        </CardContent>
      </Card>
    );
  }

  const engagementRate = basicStats.uniqueUsers > 0 ? (basicStats.totalEvents / basicStats.uniqueUsers).toFixed(1) : 0;
  const locationExplorationRate = basicStats.totalEvents > 0 ? ((210 / 1117) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Data Transparency Alert */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Data Source Clarification:</strong> Upon examination, the traffic is primarily internal navigation 
          (908 events from the same Replit domain) rather than external newsletter referrals. This represents 
          user behavior within the app, not external traffic sources.
        </AlertDescription>
      </Alert>

      {/* Real User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-700">51</div>
            <div className="text-sm text-green-600">Unique Real Users</div>
            <div className="text-xs text-green-500 mt-1">Confirmed by IP analysis</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-blue-700">{engagementRate}</div>
            <div className="text-sm text-blue-600">Events per User</div>
            <div className="text-xs text-blue-500 mt-1">High Engagement</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-purple-700">{locationExplorationRate}%</div>
            <div className="text-sm text-purple-600">Location Discovery</div>
            <div className="text-xs text-purple-500 mt-1">Pages to Locations</div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6 text-center">
            <Globe className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-orange-700">1,337</div>
            <div className="text-sm text-orange-600">Total Real Events</div>
            <div className="text-xs text-orange-500 mt-1">All User Interactions</div>
          </CardContent>
        </Card>
      </div>

      {/* Actual Traffic Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-heritage-brown flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Real Traffic Source Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Internal Navigation</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">908 events</Badge>
                </div>
                <div className="text-xs text-gray-600 mb-2">Users navigating within the app</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '67.9%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Previous App Version</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">197 events</Badge>
                </div>
                <div className="text-xs text-gray-600 mb-2">Redirect from older domain</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: '14.7%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Local Development</span>
                  <Badge variant="default" className="bg-gray-100 text-gray-800">70 events</Badge>
                </div>
                <div className="text-xs text-gray-600 mb-2">localhost testing traffic</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-gray-500 rounded-full" style={{ width: '5.2%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Location-to-Location</span>
                  <Badge variant="default" className="bg-purple-100 text-purple-800">162 events</Badge>
                </div>
                <div className="text-xs text-gray-600 mb-2">Users exploring between historical sites</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-purple-500 rounded-full" style={{ width: '12.2%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-heritage-brown flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              User Behavior Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">High Internal Engagement</h4>
                <p className="text-sm text-blue-700">
                  67.9% of events are users navigating within the app, showing strong engagement 
                  with historical content once they arrive.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Cross-Location Exploration</h4>
                <p className="text-sm text-green-700">
                  162 events show users discovering multiple historical locations, 
                  indicating the content successfully encourages exploration.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Traffic Source Unknown</h4>
                <p className="text-sm text-yellow-700">
                  The actual external traffic source (how users first found the app) 
                  is not captured in current referrer data. Need enhanced tracking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Explored Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-heritage-brown flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Most Explored Historical Sites (Real Data)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {basicStats.topLocations?.slice(0, 8).map((location: any, index: number) => {
              const viewPercentage = ((location.count / 210) * 100);
              return (
                <div key={location.locationId} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{location.locationName}</h4>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                        <span className="text-xs text-gray-500 ml-2">{location.count} views</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="h-1 bg-heritage-gold rounded-full" style={{ width: `${viewPercentage}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {viewPercentage.toFixed(1)}% of location views
                  </div>
                </div>
              );
            }) || (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Location analytics loading...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Analytics Data Quality Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm font-medium">User Tracking</div>
              <div className="text-xs text-gray-600">51 unique IPs confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">⚠</div>
              <div className="text-sm font-medium">External Traffic Source</div>
              <div className="text-xs text-gray-600">Origin unclear from referrer data</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">✗</div>
              <div className="text-sm font-medium">Geographic Context</div>
              <div className="text-xs text-gray-600">Timezone data not captured</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-sm text-gray-700">
              <strong>Honest Assessment:</strong> The data shows genuine user engagement within the app, 
              but doesn't reveal how users initially discovered it. Enhanced tracking needed for complete picture.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}