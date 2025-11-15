import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink,
  Info,
  CheckCircle,
  AlertCircle,
  Copy,
  Link
} from "lucide-react";
import { useState } from "react";

export function EnhancedTrackingGuide() {
  const [copiedUrl, setCopiedUrl] = useState("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(""), 2000);
  };

  const baseUrl = window.location.origin;
  
  const exampleUrls = [
    {
      label: "Bainbridge Concierge",
      url: `${baseUrl}?utm_source=bainbridge_concierge&utm_medium=chatbot&utm_campaign=visitor_recommendations&utm_content=historical_sites`,
      description: "Track visitors from Bainbridge Concierge virtual assistant"
    },
    {
      label: "Newsletter Campaign",
      url: `${baseUrl}?utm_source=newsletter&utm_medium=email&utm_campaign=beta_launch&utm_content=header_link`,
      description: "Track newsletter reader engagement"
    },
    {
      label: "Social Media Post",
      url: `${baseUrl}?utm_source=facebook&utm_medium=social&utm_campaign=historical_content&utm_content=fort_casey_post`,
      description: "Track social media discovery"
    },
    {
      label: "Blog Article Link",
      url: `${baseUrl}?utm_source=medium&utm_medium=referral&utm_campaign=guest_post&utm_content=pnw_history_article`,
      description: "Track content marketing effectiveness"
    },
    {
      label: "Print QR Code",
      url: `${baseUrl}?utm_source=print&utm_medium=qr_code&utm_campaign=museum_partnership&utm_content=brochure`,
      description: "Track offline marketing"
    }
  ];

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Enhanced Tracking Now Active:</strong> The system now captures initial traffic sources, 
          UTM parameters, session context, and device information for accurate user journey analysis.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-heritage-brown flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Now Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Initial Traffic Source</span>
                <Badge variant="outline" className="text-green-700 border-green-200">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">UTM Campaign Parameters</span>
                <Badge variant="outline" className="text-green-700 border-green-200">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Session Journey Tracking</span>
                <Badge variant="outline" className="text-green-700 border-green-200">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Device & Browser Context</span>
                <Badge variant="outline" className="text-green-700 border-green-200">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Geographic Hints (Timezone/Language)</span>
                <Badge variant="outline" className="text-green-700 border-green-200">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">User Intent Detection</span>
                <Badge variant="outline" className="text-green-700 border-green-200">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-heritage-brown flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
              Data Quality Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <div className="font-medium text-sm text-green-800">✓ Session Persistence</div>
                <div className="text-xs text-green-700">Traffic source stored for entire user session</div>
              </div>
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <div className="font-medium text-sm text-green-800">✓ First-Touch Attribution</div>
                <div className="text-xs text-green-700">Captures initial discovery source, not just last click</div>
              </div>
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <div className="font-medium text-sm text-green-800">✓ Enhanced Context</div>
                <div className="text-xs text-green-700">Device type, screen size, browser capabilities</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-heritage-brown flex items-center">
            <Link className="w-5 h-5 mr-2" />
            UTM Tracking Examples
          </CardTitle>
          <CardDescription>
            Use these URLs to track specific marketing campaigns and traffic sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exampleUrls.map((example, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{example.label}</h4>
                  <button
                    onClick={() => copyToClipboard(example.url, example.label)}
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {copiedUrl === example.label ? "Copied!" : "Copy URL"}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mb-2">{example.description}</p>
                <div className="bg-gray-50 rounded p-2 text-xs font-mono break-all">
                  {example.url}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center">
            <ExternalLink className="w-5 h-5 mr-2" />
            Next Steps for Marketing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>• Use UTM parameters in all external links (newsletters, social media, partnerships)</div>
            <div>• Share trackable URLs with museums and historical societies for partnerships</div>
            <div>• Add QR codes with UTM tracking to printed materials</div>
            <div>• Monitor traffic source data in the Raw Analytics dashboard</div>
            <div>• Test campaign effectiveness by comparing UTM source performance</div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-sm text-gray-700">
              <strong>Pro Tip:</strong> The system now captures the initial traffic source for each user's 
              entire session, giving you accurate first-touch attribution instead of just the last click.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}