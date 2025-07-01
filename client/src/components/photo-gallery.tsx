import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Photo {
  id: string;
  src: string;
  caption: string;
  alt: string;
}

interface PhotoGalleryProps {
  photos?: Photo[];
  title?: string;
}

export default function PhotoGallery({ 
  photos = [], 
  title = "Historical Photo Gallery" 
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Sample historical photos if none provided
  const defaultPhotos: Photo[] = [
    {
      id: "1",
      src: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      caption: "Early Settlers, 1890s",
      alt: "Vintage island settlers"
    },
    {
      id: "2",
      src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      caption: "Ferry Service, 1920s",
      alt: "Historic ferry service"
    },
    {
      id: "3",
      src: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      caption: "Logging Era, 1910s",
      alt: "Historic logging operations"
    },
    {
      id: "4",
      src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
      caption: "School Days, 1930s",
      alt: "Historic island school"
    },
  ];

  const displayPhotos = photos.length > 0 ? photos : defaultPhotos;

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-heritage-brown mb-4">{title}</h2>
          <p className="text-xl text-gray-600">Rare photographs that capture Bainbridge Island's past</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayPhotos.map((photo) => (
            <Dialog key={photo.id}>
              <DialogTrigger asChild>
                <Card className="bg-heritage-beige p-2 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                  <img 
                    src={photo.src} 
                    alt={photo.alt}
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="text-xs text-center mt-2 text-heritage-olive">
                    {photo.caption}
                  </p>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <img 
                  src={photo.src} 
                  alt={photo.alt}
                  className="w-full h-auto rounded-lg"
                />
                <p className="text-center text-heritage-olive font-medium mt-4">
                  {photo.caption}
                </p>
              </DialogContent>
            </Dialog>
          ))}
          
          {/* Add More Photos Button */}
          <Card className="bg-heritage-beige p-2 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
            <div className="bg-gray-200 w-full h-32 rounded flex items-center justify-center">
              <div className="text-center text-heritage-olive">
                <Plus className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">More Photos</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
