import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';

interface AudioPlayerProps {
  locationId: number;
  locationName: string;
  className?: string;
}

export default function EnhancedAudioPlayer({ locationId, locationName, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAudio, setHasAudio] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAndLoadAudio = async () => {
      try {
        // Simple HEAD request to check if audio exists
        const response = await fetch(`/api/locations/${locationId}/audio`, { 
          method: 'HEAD'
        });
        
        if (!mounted) return;
        
        if (response.ok) {
          setAudioUrl(`/api/locations/${locationId}/audio`);
          setHasAudio(true);
          console.log(`Audio available for location ${locationId}`);
        } else {
          setHasAudio(false);
        }
      } catch (error) {
        if (mounted) {
          setHasAudio(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAndLoadAudio();

    return () => {
      mounted = false;
    };
  }, [locationId]);

  const togglePlay = () => {
    if (!audioRef.current || !isReady) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleCanPlay = () => {
    setIsReady(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleError = (e: any) => {
    console.error('Audio error:', e);
    setHasAudio(false);
    setIsReady(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAudio) {
    return (
      <Card className={cn("w-full border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
              <Volume2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Audio narration temporarily unavailable
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Audio content is being updated and will return soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900 dark:to-amber-800 border border-orange-200 dark:border-orange-700 rounded-lg p-4 my-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-600 text-white text-lg">
          🎧
        </div>
        <div>
          <h4 className="font-semibold text-orange-900 dark:text-orange-100">
            Audio Tour
          </h4>
          <p className="text-sm text-orange-600 dark:text-orange-300">
            Listen to the story of {locationName}
          </p>
        </div>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlayThrough={handleCanPlay}
          onLoadedData={() => console.log('Audio data loaded')}
          onCanPlay={() => console.log('Audio can play')}
          onPlay={() => {
            setIsPlaying(true);
            console.log('Audio started playing');
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={handleError}
          preload="metadata"
          controls={false}
          style={{ display: 'none' }}
        />
      )}

      {/* Main Controls */}
      <div className="flex items-center space-x-3 mb-3">
        <button
          onClick={togglePlay}
          disabled={!isReady}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-700 text-white transition-colors shadow-lg border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: isReady ? '#ea580c' : '#9ca3af' }}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" style={{ color: 'white', fill: 'white' }} />
          ) : (
            <Play className="h-6 w-6 ml-0.5" style={{ color: 'white', fill: 'white' }} />
          )}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration.toString() || "0"}
            value={currentTime.toString()}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(currentTime / (duration || 1)) * 100}%, #d1d5db ${(currentTime / (duration || 1)) * 100}%, #d1d5db 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-orange-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Volume Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleMute}
          className="text-orange-600 hover:text-orange-700 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        {audioUrl && (
          <Button
            size="sm"
            variant="outline"
            asChild
            className="ml-2"
          >
            <a
              href={audioUrl}
              download={`${locationName.replace(/[^a-zA-Z0-9]/g, '-')}-audio-tour.mp3`}
              className="flex items-center"
            >
              <Download className="h-3 w-3 mr-1" />
              <span className="text-xs">Download</span>
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export { EnhancedAudioPlayer };