import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Calendar, User, Navigation, ExternalLink, FileText, BookOpen, Landmark, Compass, Mountain, Ship, Users, Clock, type LucideIcon } from "lucide-react";
import { Link } from "wouter";
import { getCategoryIcon, getCategoryColor, formatDate, getDirectionsUrl, calculateDistance } from "@/lib/utils";
import type { Location, Photo } from "@shared/schema";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AudioPlayer from "@/components/audio-player";
import { BookThumbnail } from "@/components/book-thumbnail";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ModernLocationDetailProps {
  location: Location | undefined;
  isLoading: boolean;
  error: Error | null;
  userLocation: { lat: number; lng: number } | null;
}

export default function ModernLocationDetail({ 
  location, 
  isLoading, 
  error, 
  userLocation 
}: ModernLocationDetailProps) {
  const { data: photos = [] } = useQuery({
    queryKey: ["/api/locations", location?.id, "photos"],
    queryFn: async () => {
      if (!location?.id) return [];
      const response = await fetch(`/api/locations/${location.id}/photos?t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      return response.json() as Promise<Photo[]>;
    },
    enabled: !!location?.id,
    staleTime: 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--modern-cream)] py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="w-full h-96 rounded-xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-[var(--modern-cream)] py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4" data-testid="error-title">
                Location Not Found
              </h1>
              <p className="text-gray-600 mb-6" data-testid="error-message">
                The historical location you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/">
                <Button data-testid="button-back-home">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const placeholderImage = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=1200&h=600&fit=crop`;
  const imageUrl = location.heroImage || placeholderImage;

  // Parse story content into timeline sections
  const parseStoryTimeline = (content: string) => {
    if (!content) return [];
    
    // Split by paragraphs and look for year patterns
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const timeline: Array<{ year?: string; content: string; icon: LucideIcon }> = [];
    
    const icons: LucideIcon[] = [Landmark, MapPin, Compass, Clock, Mountain, Ship, Users, BookOpen];
    
    paragraphs.forEach((para, index) => {
      // Try to extract year from the paragraph
      const yearMatch = para.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/);
      timeline.push({
        year: yearMatch ? yearMatch[0] : undefined,
        content: para,
        icon: icons[index % icons.length]
      });
    });
    
    return timeline;
  };

  const timelineItems = parseStoryTimeline(location.content || location.description);

  return (
    <div className="min-h-screen bg-[var(--modern-cream)]">
      {/* Hero Section with Dark Overlay */}
      <div className="relative h-[60vh] min-h-[500px] w-full">
        <img
          src={imageUrl}
          alt={location.name}
          className="absolute inset-0 w-full h-full object-cover"
          data-testid="img-hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        
        {/* Content Overlay */}
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-between py-8">
          {/* Back Button */}
          <div>
            <Link href="/#map">
              <Button variant="ghost" className="text-white hover:bg-white/20" data-testid="button-back-map">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Map
              </Button>
            </Link>
          </div>

          {/* Title Section */}
          <div className="space-y-4">
            <Badge 
              variant="secondary" 
              className="bg-[var(--modern-sage)] text-white border-0" 
              data-testid="badge-category"
            >
              {location.category}
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight max-w-4xl" data-testid="text-location-name">
              {location.name}
            </h1>

            {location.period && (
              <div className="inline-flex items-center px-4 py-2 bg-black/40 rounded-full backdrop-blur-sm" data-testid="text-period">
                <Calendar className="w-5 h-5 mr-2 text-white" />
                <span className="font-semibold text-white">{location.period}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8 xl:gap-12">
          {/* Left Column - Story Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Audio Player */}
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <AudioPlayer 
                locationId={location.id}
                locationName={location.name}
                className="bg-transparent border-0"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-lg leading-relaxed text-gray-700" data-testid="text-description">
                {location.description}
              </p>
            </div>

            {/* The Story Timeline */}
            {timelineItems.length > 0 && (
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-8 flex items-center" data-testid="text-story-title">
                  <FileText className="w-6 h-6 mr-3 text-[var(--modern-sage)]" />
                  The Story
                </h2>
                
                <div className="space-y-8">
                  {timelineItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                    <div key={index} className="flex gap-6">
                      {/* Icon Column */}
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--modern-sage)]/10 border-2 border-[var(--modern-sage)]/30"
                          data-testid={`icon-timeline-${index}`}
                        >
                          <IconComponent className="w-5 h-5 text-[var(--modern-sage)]" />
                        </div>
                        {index < timelineItems.length - 1 && (
                          <div className="w-0.5 h-full min-h-[60px] bg-[var(--modern-sage)]/20 mt-2" />
                        )}
                      </div>
                      
                      {/* Content Column */}
                      <div className="flex-1 pb-4">
                        {item.year && (
                          <div 
                            className="text-xl font-bold mb-2 text-[var(--modern-olive-dark)]"
                            data-testid={`text-year-${index}`}
                          >
                            {item.year}
                          </div>
                        )}
                        <div 
                          className="prose prose-sm sm:prose-base max-w-none text-gray-700"
                          data-testid={`text-timeline-content-${index}`}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {item.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {location.latitude && location.longitude && (
                <Button 
                  onClick={() => window.open(getDirectionsUrl(location, userLocation || undefined), '_blank')}
                  className="bg-[var(--modern-sage)] hover:bg-[var(--modern-sage)]/90"
                  data-testid="button-directions"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Directions
                </Button>
              )}
              <Button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: location.name,
                      text: location.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                variant="outline"
                data-testid="button-share"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Submission Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-3">
                Contribution Information
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                {location.submitterName && (
                  <div className="flex items-center" data-testid="text-submitter">
                    <User className="w-4 h-4 mr-2" />
                    <span>Submitted by: {location.submitterName}</span>
                  </div>
                )}
                {location.createdAt && (
                  <div className="flex items-center" data-testid="text-created-at">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Added: {formatDate(location.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Photos & Location */}
          <div className="space-y-6">
            {/* Photos */}
            {photos.length > 0 && (
              <div className="bg-[var(--modern-card-bg)] rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-[var(--modern-text-light)] flex items-center">
                  <span className="mr-2">📷</span>
                  Photos
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {photos.slice(0, 3).map((photo) => (
                    <Dialog key={photo.id}>
                      <DialogTrigger asChild>
                        <div className="relative cursor-pointer group aspect-square">
                          <img
                            src={photo.filename}
                            alt={photo.caption || `Photo of ${location.name}`}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                            data-testid={`img-photo-${photo.id}`}
                          />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogTitle className="sr-only">
                          {photo.caption || `Photo of ${location.name}`}
                        </DialogTitle>
                        <img
                          src={photo.filename}
                          alt={photo.caption || `Photo of ${location.name}`}
                          className="w-full max-h-[80vh] object-contain rounded-lg"
                        />
                        {photo.caption && (
                          <p className="mt-4 text-gray-700">{photo.caption}</p>
                        )}
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
                {photos.length > 3 && (
                  <p className="mt-3 text-sm text-[var(--modern-text-light)]/70">
                    +{photos.length - 3} more photos
                  </p>
                )}
              </div>
            )}

            {/* Location Map */}
            {location.latitude && location.longitude && (
              <div className="bg-[var(--modern-card-bg)] rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-[var(--modern-text-light)] flex items-center" data-testid="text-map-title">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location
                </h3>
                <div className="h-48 bg-muted rounded-lg border relative overflow-hidden mb-3" data-testid="map-container">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude-0.01},${location.latitude-0.01},${location.longitude+0.01},${location.latitude+0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    title={`Map showing ${location.name}`}
                  />
                </div>
                {location.address && (
                  <p className="text-sm text-[var(--modern-text-light)]/80 mb-3" data-testid="text-address">
                    {location.address}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=15`, '_blank')}
                  className="w-full bg-white/10 border-white/20 text-[var(--modern-text-light)] hover:bg-white/20"
                  data-testid="button-openstreetmap"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on OpenStreetMap
                </Button>

                {/* Distance */}
                {userLocation && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-[var(--modern-text-light)]/70">Distance from you</p>
                    <p className="text-lg font-bold text-[var(--modern-text-light)]" data-testid="text-distance">
                      {calculateDistance(
                        userLocation,
                        { lat: location.latitude, lng: location.longitude }
                      ).toFixed(1)} miles away
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Further Reading Section - Full Width */}
        {location.recommendedBooks && JSON.parse(location.recommendedBooks).length > 0 && (
          <div className="mt-16">
            <div className="bg-gradient-to-br from-[var(--modern-sage)] to-[var(--modern-olive-dark)] rounded-2xl p-8 sm:p-12 shadow-lg">
              <div className="flex items-center mb-8">
                <BookOpen className="w-8 h-8 mr-4 text-white" />
                <div>
                  <h2 className="text-3xl font-bold text-white" data-testid="text-books-title">
                    Further Reading
                  </h2>
                  <p className="text-white/80 mt-1">
                    Deepen your understanding with these recommended books
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {JSON.parse(location.recommendedBooks).map((book: any, index: number) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl p-5 hover:shadow-xl transition-shadow"
                    data-testid={`card-book-${index}`}
                  >
                    <div className="flex items-start space-x-4">
                      <BookThumbnail 
                        amazonUrl={book.amazonUrl || book.amazon_url}
                        thumbnailUrl={book.thumbnailUrl || book.thumbnail_url}
                        title={book.title}
                        author={book.author}
                        size="large"
                      />
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-lg" data-testid={`text-book-title-${index}`}>
                            {book.title}
                          </h3>
                          {book.category && (
                            <span className="px-2 py-1 text-xs bg-[var(--modern-sage)]/20 text-[var(--modern-sage)] rounded border border-[var(--modern-sage)]/30" data-testid={`badge-book-category-${index}`}>
                              {book.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2" data-testid={`text-book-author-${index}`}>
                          by {book.author}
                        </p>
                        <p className="text-sm text-gray-700 mb-4" data-testid={`text-book-description-${index}`}>
                          {book.description}
                        </p>
                        <a
                          href={book.amazonUrl || book.amazon_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 text-sm bg-[var(--modern-terra-cotta)] text-white rounded-lg hover:bg-[var(--modern-terra-cotta)]/90 transition-colors font-medium"
                          data-testid={`link-book-amazon-${index}`}
                          onClick={async () => {
                            try {
                              await fetch('/api/affiliate-clicks', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  locationId: location.id,
                                  bookTitle: book.title,
                                }),
                              });
                            } catch (error) {
                              console.error('Failed to track affiliate click:', error);
                            }
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Amazon
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-xs text-white/70" data-testid="text-affiliate-disclaimer">
                  As an Amazon Associate, Pacific Northwest Historical Explorer earns from qualifying purchases. 
                  This helps support the development and maintenance of this historical resource.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
