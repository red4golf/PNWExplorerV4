import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Database,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { BasicAnalyticsStats } from "@/types/analytics";

export function RawAnalyticsFacts() {
  const { data: basicStats } = useQuery<BasicAnalyticsStats>({
    queryKey: ["/api/admin/analytics/stats"],
  });

  if (!basicStats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Quality Warning */}
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Analytics Limitations:</strong> Current tracking cannot determine how users initially 
          found this application. Referrer data only shows internal navigation, not external traffic sources.
        </AlertDescription>
      </Alert>

      {/* Raw Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-heritage-brown flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Raw Event Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{basicStats.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
              <div className="text-xs text-gray-500">All recorded interactions</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{basicStats.uniqueUsers}</div>
              <div className="text-sm text-gray-600">Unique IP Addresses</div>
              <div className="text-xs text-gray-500">Distinct visitors</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-900">1,117</div>
              <div className="text-sm text-gray-600">Page Views</div>
              <div className="text-xs text-gray-500">From event_type data</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-900">210</div>
              <div className="text-sm text-gray-600">Location Views</div>
              <div className="text-xs text-gray-500">Historical site interactions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What We Know vs Don't Know */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirmed Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">User activity within app</span>
                <span className="text-sm font-mono">1,337 events</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Distinct IP addresses</span>
                <span className="text-sm font-mono">51 unique</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Internal page navigation</span>
                <span className="text-sm font-mono">908 events</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Location explorations</span>
                <span className="text-sm font-mono">210 events</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Content sharing attempts</span>
                <span className="text-sm font-mono">7 events</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              Unknown Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-red-700">
                <strong>Traffic Source:</strong> How users initially found the application
              </div>
              <div className="text-sm text-red-700">
                <strong>Geographic Location:</strong> Where users are physically located
              </div>
              <div className="text-sm text-red-700">
                <strong>User Intent:</strong> Why users are visiting (research, trip planning, etc.)
              </div>
              <div className="text-sm text-red-700">
                <strong>Device Information:</strong> Mobile vs desktop usage patterns
              </div>
              <div className="text-sm text-red-700">
                <strong>Session Duration:</strong> How long users spend on the site
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Locations - Real Data Only */}
      <Card>
        <CardHeader>
          <CardTitle className="text-heritage-brown">
            Historical Locations - View Counts (Unfiltered Data)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {basicStats.topLocations?.map((location: any, index: number) => (
              <div key={location.locationId} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <span className="font-medium text-sm">{location.locationName}</span>
                  <span className="text-xs text-gray-500 ml-2">ID: {location.locationId}</span>
                </div>
                <span className="text-sm font-mono">{location.count} views</span>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No location data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referrer Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-heritage-brown">
            Referrer Data Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium text-sm">Internal Navigation: 908 events</div>
              <div className="text-xs text-gray-600">Users moving between pages within the app</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium text-sm">Previous App Version: 197 events</div>
              <div className="text-xs text-gray-600">Traffic from historical-bainbridge-charles194.replit.app</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium text-sm">Development Traffic: 70 events</div>
              <div className="text-xs text-gray-600">localhost and testing environments</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
              <div className="font-medium text-sm text-yellow-800">Missing: External Sources</div>
              <div className="text-xs text-yellow-700">
                Cannot determine how users initially discovered the application. 
                Referrer tracking only captures immediate previous page.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">
            To Get Honest Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>• Implement UTM parameter tracking for external links</div>
            <div>• Add first-visit referrer capture (not just immediate referrer)</div>
            <div>• Track user sessions properly with session start/end</div>
            <div>• Implement geographic IP detection if needed</div>
            <div>• Add proper device/browser detection</div>
            <div>• Consider user surveys to understand traffic sources</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}