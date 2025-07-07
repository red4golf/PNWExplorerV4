import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, X } from "lucide-react";
import { useState } from "react";
import type { Photo } from "@shared/schema";

interface LocationPhotoGalleryProps {
  locationId: number;
  locationName: string;
}

export default function LocationPhotoGallery({ locationId, locationName }: LocationPhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["/api/locations", locationId, "photos"],
    queryFn: async () => {
      const response = await fetch(`/api/locations/${locationId}/photos`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      return response.json() as Promise<Photo[]>;
    },
    staleTime: 30000, // 30 seconds cache
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Camera className="w-4 h-4" />
        <span className="text-sm">Loading photos...</span>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <Camera className="w-4 h-4" />
        <span className="text-sm">No photos available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Camera className="w-5 h-5 text-heritage-gold" />
        <h3 className="font-semibold text-heritage-brown">Photo Gallery</h3>
        <Badge variant="secondary">{photos.length} photos</Badge>
      </div>

      {/* Photo Grid - Responsive Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {photos.map((photo) => (
          <Dialog key={photo.id}>
            <DialogTrigger asChild>
              <div className="relative cursor-pointer group">
                <img
                  src={photo.filename}
                  alt={photo.caption || `Photo of ${locationName}`}
                  className="w-full h-24 sm:h-28 md:h-32 lg:h-36 object-cover rounded-lg shadow-md hover:shadow-lg transition-all group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=400&h=300&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{photo.caption}</p>
                  </div>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogTitle className="sr-only">
                {photo.caption || `Photo of ${locationName}`}
              </DialogTitle>
              <div className="relative">
                <img
                  src={photo.filename}
                  alt={photo.caption || `Photo of ${locationName}`}
                  className="w-full max-h-[80vh] object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=800&h=600&fit=crop';
                  }}
                />
                {photo.caption && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{photo.caption}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}