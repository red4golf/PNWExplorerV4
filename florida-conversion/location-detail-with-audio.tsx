import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Clock, ExternalLink, Volume2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useAnalytics } from "../hooks/use-analytics";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SEOHelmet } from "../lib/seo";
import { AudioPlayer } from "../components/ui/audio-player";

// Types for Florida book recommendations
interface BookRecommendation {
  title: string;
  author: string;
  amazon_url: string;
  format: string;
  price: string;
  description: string;
  category?: string;
}

interface FloridaLocation {
  id: number;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  period: string;
  photos: string[];
  heroImage?: string;
  content: string;
  audioNarration?: string;
  recommendedBooks?: string;
  submitterName: string;
  submitterEmail: string;
  status: string;
  createdAt: string;
}

export default function LocationDetailWithAudio() {
  const { id } = useParams<{ id: string }>();
  const { trackLocationView } = useAnalytics();
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const { data: location, isLoading } = useQuery<FloridaLocation>({
    queryKey: ['/api/locations', id],
    enabled: !!id,
  });

  useEffect(() => {
    if (location && id) {
      trackLocationView(parseInt(id));
    }
  }, [location, id, trackLocationView]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Location not found</h1>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Map
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Parse book recommendations
  let bookRecommendations: BookRecommendation[] = [];
  if (location.recommendedBooks) {
    try {
      bookRecommendations = JSON.parse(location.recommendedBooks);
    } catch (e) {
      console.error("Failed to parse book recommendations:", e);
    }
  }

  const handleGetDirections = () => {
    if (location.latitude && location.longitude) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <SEOHelmet 
        title={`${location.name} - Florida Historical Explorer`}
        description={location.description}
        type="article"
        image={location.heroImage ? `/api/files/${location.heroImage}` : undefined}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
          </Link>
          <Badge variant="secondary">{location.category}</Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Description */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {location.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{location.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{location.period}</span>
                </div>
              </div>

              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {location.description}
              </p>
            </div>

            {/* Audio Narration */}
            {location.audioNarration && (
              <div>
                <AudioPlayer 
                  audioUrl={location.audioNarration}
                  locationName={location.name}
                  className="mb-8"
                />
              </div>
            )}

            {/* Story Content */}
            {location.content && (
              <Card className="p-6">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {location.content}
                  </ReactMarkdown>
                </div>
              </Card>
            )}

            {/* Book Recommendations */}
            {bookRecommendations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Further Reading
                </h2>
                <div className="grid gap-4">
                  {bookRecommendations.map((book, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {book.title}
                            </h3>
                            {book.category && (
                              <Badge variant="outline" className="text-xs">
                                {book.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            by {book.author}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            {book.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>{book.format}</span>
                            <span>{book.price}</span>
                          </div>
                        </div>
                        <Button size="sm" asChild>
                          <a href={book.amazon_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on Amazon
                          </a>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  As an Amazon Associate, Florida Historical Explorer earns from qualifying purchases. 
                  This helps us maintain and improve the platform at no additional cost to you.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hero Image */}
            {location.heroImage && (
              <Card className="overflow-hidden">
                <img 
                  src={`/api/files/${location.heroImage}`}
                  alt={location.name}
                  className="w-full h-64 object-cover"
                />
              </Card>
            )}

            {/* Interactive Map */}
            {location.latitude && location.longitude && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Location</h3>
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md mb-4 overflow-hidden">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude-0.01},${location.latitude-0.01},${location.longitude+0.01},${location.latitude+0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
                    className="w-full h-full border-0"
                    title={`Map of ${location.name}`}
                  ></iframe>
                </div>
                <Button onClick={handleGetDirections} className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}