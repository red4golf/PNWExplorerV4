import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  locationId: number;
  locationName: string;
  className?: string;
}

export default function AudioPlayer({ locationId, locationName, className }: AudioPlayerProps) {
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
    let currentBlobUrl: string | null = null;

    const checkAndLoadAudio = async () => {
      try {
        // Cache-busting timestamp to force fresh audio load
        const cacheBuster = Date.now();
        
        // Simple HEAD request to check if audio exists
        const response = await fetch(`/api/locations/${locationId}/audio?v=${cacheBuster}`, { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (!mounted) return;
        
        if (response.ok) {
          setAudioUrl(`/api/locations/${locationId}/audio?v=${cacheBuster}`);
          setHasAudio(true);
          console.log(`Audio available for location ${locationId} (v=${cacheBuster})`);
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
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [locationId]);

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          console.log('Attempting to play audio...');
          // Force reload if needed
          if (audioRef.current.readyState === 0) {
            audioRef.current.load();
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          await audioRef.current.play();
        }
      } catch (error) {
        console.log('Play failed, attempting to reload audio...', error);
        audioRef.current.load();
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current && audioRef.current.duration) {
      try {
        audioRef.current.currentTime = Math.min(time, audioRef.current.duration);
        setCurrentTime(time);
      } catch (error) {
        console.warn('Audio seek failed:', error);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      try {
        audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
      } catch (error) {
        console.warn('Volume change failed:', error);
      }
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      try {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        audioRef.current.muted = newMutedState;
      } catch (error) {
        console.warn('Mute toggle failed:', error);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isNaN(audioRef.current.currentTime)) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
      setIsReady(true);
      console.log(`Audio metadata loaded: duration=${audioRef.current.duration}s`);
    }
  };

  const handleCanPlay = () => {
    setIsReady(true);
  };

  const handleError = (e: any) => {
    // Silently handle audio errors to prevent cross-origin issues
    setIsPlaying(false);
    setIsReady(false);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
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
    <div className="w-full bg-gradient-to-r from-heritage-50 to-heritage-100 dark:from-heritage-900 dark:to-heritage-800 border border-heritage-200 dark:border-heritage-700 rounded-lg p-4 my-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm">
          <Headphones className="h-5 w-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-white">
            Audio Tour
          </h4>
          <p className="text-sm text-white/80">
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
          className="flex items-center justify-center w-12 h-12 rounded-full bg-heritage-600 hover:bg-heritage-700 text-white transition-colors shadow-lg border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: isReady ? '#8b5a3c' : '#9ca3af' }}
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
              background: `linear-gradient(to right, #8b5a3c 0%, #8b5a3c ${(currentTime / (duration || 1)) * 100}%, #d1d5db ${(currentTime / (duration || 1)) * 100}%, #d1d5db 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-white/90 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 text-white/90 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={(isMuted ? 0 : volume).toString()}
            onChange={handleVolumeChange}
            className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #8b5a3c 0%, #8b5a3c ${volume * 100}%, #d1d5db ${volume * 100}%, #d1d5db 100%)`
            }}
          />
        </div>

        <button
          onClick={() => {
            if (audioUrl) {
              const link = document.createElement('a');
              link.href = audioUrl;
              link.download = `${locationName}-audio-tour.mp3`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
          className="flex items-center space-x-1 text-white/90 hover:text-white transition-colors text-sm"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </div>
  );
}