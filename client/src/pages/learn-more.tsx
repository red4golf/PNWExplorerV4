import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, TreePine, Mountain, Users, Calendar, Clock, BookOpen, Star } from "lucide-react";
import type { Location } from "@shared/schema";

export default function LearnMore() {
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  return (
    <div className="bg-heritage-cream min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-heritage-brown hover:bg-heritage-beige"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-heritage-brown">About Pacific Northwest Historical Explorer</h1>
            <div className="w-24"></div> {/* Spacer for center alignment */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-heritage-brown mb-6">
            Discover the Pacific Northwest's Rich History
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our interactive platform brings together the diverse stories, landmarks, and cultural heritage 
            spanning Washington, Oregon, Northern California, Idaho, Montana, and Southern British Columbia. 
            From ancient indigenous traditions to modern innovations, explore the complete tapestry of Pacific Northwest history.
          </p>
        </section>

        {/* Statistics Dashboard */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white">
                <CardContent className="p-6 text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : locations && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white border-2 border-heritage-gold">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-heritage-gold mb-2">{locations.length}</div>
                <div className="text-sm text-heritage-brown font-medium">Historic Locations</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-2 border-amber-400">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-amber-600 mb-2">
                  {locations.filter(l => l.category === 'Historical').length}
                </div>
                <div className="text-sm text-amber-700 font-medium">Historical Sites</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-2 border-green-400">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {locations.filter(l => l.category === 'Natural').length}
                </div>
                <div className="text-sm text-green-700 font-medium">Natural Wonders</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-2 border-blue-400">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {locations.filter(l => l.category === 'Cultural').length}
                </div>
                <div className="text-sm text-blue-700 font-medium">Cultural Heritage</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Deep Dive */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-heritage-brown mb-8 text-center">
            Explore by Category
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-8">
                <TreePine className="w-16 h-16 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">Natural Wonders</h3>
                <p className="text-green-700 mb-6 text-center">
                  Ancient forests, volcanic landscapes, pristine wilderness areas, and geological marvels that shaped the region
                </p>
                <div className="space-y-2 text-sm text-green-600">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Redwood National and State Parks
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Mount St. Helens
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Crater Lake National Park
                  </div>
                </div>
                <div className="text-center mt-6">
                  <Badge variant="secondary" className="bg-green-200 text-green-800 text-lg px-4 py-2">
                    {locations ? locations.filter(l => l.category === 'Natural').length : 0} locations
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-8">
                <Mountain className="w-16 h-16 text-amber-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-amber-800 mb-4 text-center">Historical Sites</h3>
                <p className="text-amber-700 mb-6 text-center">
                  Gold rush towns, frontier forts, landmark battles, and pivotal moments that defined the Pacific Northwest
                </p>
                <div className="space-y-2 text-sm text-amber-600">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Fort Clatsop National Memorial
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Klondike Gold Rush National Historical Park
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Whitman Mission National Historic Site
                  </div>
                </div>
                <div className="text-center mt-6">
                  <Badge variant="secondary" className="bg-amber-200 text-amber-800 text-lg px-4 py-2">
                    {locations ? locations.filter(l => l.category === 'Historical').length : 0} locations
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-8">
                <Users className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">Cultural Heritage</h3>
                <p className="text-blue-700 mb-6 text-center">
                  Indigenous traditions, maritime culture, modern innovations, and the diverse communities that call this region home
                </p>
                <div className="space-y-2 text-sm text-blue-600">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Duwamish Longhouse & Cultural Center
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Pike Place Market
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Japanese American Exclusion Memorial
                  </div>
                </div>
                <div className="text-center mt-6">
                  <Badge variant="secondary" className="bg-blue-200 text-blue-800 text-lg px-4 py-2">
                    {locations ? locations.filter(l => l.category === 'Cultural').length : 0} locations
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Geographic Coverage */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-heritage-brown mb-8 text-center">
            Geographic Coverage
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-heritage-brown mb-3">Washington State</h3>
                <p className="text-gray-600 mb-4">
                  From coastal fortifications to mountain wilderness, urban innovation to rural heritage
                </p>
                <div className="flex items-center text-sm text-heritage-brown">
                  <MapPin className="w-4 h-4 mr-2" />
                  Olympic Peninsula • Puget Sound • Cascade Range
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-heritage-brown mb-3">Oregon</h3>
                <p className="text-gray-600 mb-4">
                  Oregon Trail endpoints, coastal lighthouses, volcanic landscapes, and pioneer settlements
                </p>
                <div className="flex items-center text-sm text-heritage-brown">
                  <MapPin className="w-4 h-4 mr-2" />
                  Columbia River Gorge • Cascade Range • Coast
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-heritage-brown mb-3">Northern California</h3>
                <p className="text-gray-600 mb-4">
                  Ancient redwood forests, volcanic monuments, and indigenous cultural sites
                </p>
                <div className="flex items-center text-sm text-heritage-brown">
                  <MapPin className="w-4 h-4 mr-2" />
                  Redwood Coast • Shasta Region • Lava Beds
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-heritage-brown mb-3">Idaho</h3>
                <p className="text-gray-600 mb-4">
                  Mining heritage, wilderness recreation, and geological wonders
                </p>
                <div className="flex items-center text-sm text-heritage-brown">
                  <MapPin className="w-4 h-4 mr-2" />
                  Sawtooth Range • Sun Valley • Craters of the Moon
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-heritage-brown mb-3">Montana</h3>
                <p className="text-gray-600 mb-4">
                  Glacier National Park and western Montana's mountain heritage
                </p>
                <div className="flex items-center text-sm text-heritage-brown">
                  <MapPin className="w-4 h-4 mr-2" />
                  Rocky Mountains • Glacier National Park
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-heritage-brown mb-3">Southern British Columbia</h3>
                <p className="text-gray-600 mb-4">
                  Gold rush boomtowns, frontier law enforcement, and Canadian heritage
                </p>
                <div className="flex items-center text-sm text-heritage-brown">
                  <MapPin className="w-4 h-4 mr-2" />
                  Cariboo Region • Kootenay Rockies
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-heritage-brown mb-8 text-center">
            Platform Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white">
              <CardContent className="p-8">
                <MapPin className="w-12 h-12 text-heritage-brown mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-heritage-brown mb-4 text-center">Interactive Mapping</h3>
                <p className="text-gray-600 text-center">
                  GPS-enabled maps with location detection, filtering by category and time period, 
                  and turn-by-turn directions to historical sites
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-8">
                <BookOpen className="w-12 h-12 text-heritage-brown mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-heritage-brown mb-4 text-center">Rich Storytelling</h3>
                <p className="text-gray-600 text-center">
                  Detailed historical narratives with markdown formatting, photo galleries, 
                  and recommended reading for deeper exploration
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-8">
                <Users className="w-12 h-12 text-heritage-brown mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-heritage-brown mb-4 text-center">Community Contributions</h3>
                <p className="text-gray-600 text-center">
                  Submit new locations, share feedback, and help preserve Pacific Northwest history 
                  through community-driven content
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardContent className="p-8">
                <Clock className="w-12 h-12 text-heritage-brown mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-heritage-brown mb-4 text-center">Historical Timeline</h3>
                <p className="text-gray-600 text-center">
                  Explore locations by time period, from prehistoric times through modern era, 
                  understanding how history shapes the present
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-heritage-brown rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Exploring?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover {locations?.length || 0} historical locations across the Pacific Northwest 
            through our interactive map and immersive storytelling experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#map">
              <Button 
                size="lg" 
                className="bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-brown px-8 py-4 text-lg font-semibold"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Start Exploring
              </Button>
            </Link>
            <Link href="/submit">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-heritage-brown px-8 py-4 text-lg font-semibold"
              >
                <Users className="w-5 h-5 mr-2" />
                Submit a Location
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}