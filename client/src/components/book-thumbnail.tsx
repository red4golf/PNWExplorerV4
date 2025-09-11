import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { extractASIN, getAmazonThumbnail } from '@/lib/book-utils';

interface BookThumbnailProps {
  amazonUrl: string;
  title: string;
  author: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function BookThumbnail({ 
  amazonUrl, 
  title, 
  author, 
  className = '',
  size = 'medium'
}: BookThumbnailProps) {
  // Size classes
  const sizeClasses = {
    small: 'w-12 h-16',
    medium: 'w-16 h-20',
    large: 'w-20 h-28'
  };

  // Generate the Amazon image URL directly
  const asin = extractASIN(amazonUrl);
  const imageUrl = asin ? getAmazonThumbnail(asin, size === 'small' ? 'S' : size === 'large' ? 'L' : 'M') : '';
  
  // State for handling image load errors
  const [imageError, setImageError] = useState(false);

  // If no ASIN or image failed to load, show placeholder
  if (!imageUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} bg-heritage-beige rounded flex-shrink-0 flex items-center justify-center ${className}`}>
        <BookOpen className="w-8 h-8 text-heritage-brown" />
      </div>
    );
  }

  // Show actual book cover
  return (
    <div className={`${sizeClasses[size]} rounded flex-shrink-0 overflow-hidden shadow-sm ${className}`}>
      <img
        src={imageUrl}
        alt={`${title} by ${author} - Book Cover`}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
        onLoad={(e) => {
          // Check if Amazon returned a 1x1 transparent placeholder
          const img = e.currentTarget;
          if (img.naturalWidth < 50 || img.naturalHeight < 50) {
            setImageError(true);
          }
        }}
        loading="lazy"
      />
    </div>
  );
}