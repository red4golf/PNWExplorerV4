import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ArrowLeft, Search, Home } from "lucide-react";
import { updatePageSEO } from "@/lib/seo";

export default function NotFoundSEO() {
  useEffect(() => {
    // Update SEO for 404 page
    updatePageSEO({
      title: "Page Not Found - Pacific Northwest Historical Explorer",
      description: "The page you're looking for doesn't exist. Explore our interactive map of 60+ historical locations across the Pacific Northwest instead.",
      keywords: ["404", "not found", "Pacific Northwest history", "historical sites", "error page"],
      canonicalUrl: "https://historical-bainbridge-charles194.replit.app/404"
    });
  }, []);

  return (
    <div className="min-h-screen bg-heritage-cream flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <MapPin className="w-16 h-16 mx-auto text-heritage-brown mb-4" />
            <h1 className="text-2xl font-bold text-heritage-brown mb-2">
              Page Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The historical location you're looking for doesn't exist in our database.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full bg-heritage-brown hover:bg-heritage-brown/90">
                <Home className="w-4 h-4 mr-2" />
                Return to Homepage
              </Button>
            </Link>
            
            <Link href="/#map">
              <Button variant="outline" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search Historical Sites
              </Button>
            </Link>
            
            <Link href="/submit">
              <Button variant="ghost" className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                Submit a Location
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Discover 60+ historical locations across the Pacific Northwest</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}