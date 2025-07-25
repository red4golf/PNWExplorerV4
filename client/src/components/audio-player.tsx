import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';
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
        // Check if audio exists with a simple GET request
        const audioResponse = await fetch(`/api/locations/${locationId}/audio`, {
          method: 'GET',
          credentials: 'same-origin',
          mode: 'cors'
        });
        
        if (!mounted) return;
        
        if (audioResponse.ok) {
          // Get the audio as a blob and create object URL
          const audioBlob = await audioResponse.blob();
          if (audioBlob.size > 0 && audioBlob.type.startsWith('audio/')) {
            const blobUrl = URL.createObjectURL(audioBlob);
            currentBlobUrl = blobUrl;
            setAudioUrl(blobUrl);
            setHasAudio(true);
            console.log(`Audio loaded: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
          } else {
            console.warn(`Invalid audio blob: size=${audioBlob.size}, type=${audioBlob.type}`);
            setHasAudio(false);
          }
        } else {
          console.warn(`Audio request failed: ${audioResponse.status}`);
          setHasAudio(false);
        }
      } catch (error) {
        if (mounted) {
          console.warn('Audio loading error:', error);
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
          await audioRef.current.play();
        }
      } catch (error) {
        console.warn('Audio play failed:', error);
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
    }
  };

  const handleCanPlay = () => {
    setIsReady(true);
  };

  const handleError = (e: any) => {
    // Suppress cross-origin errors by checking error type
    if (e && e.target && e.target.error) {
      const errorCode = e.target.error.code;
      // Only log non-CORS related errors
      if (errorCode !== 0) {
        console.warn('Audio error code:', errorCode);
      }
    }
    setIsPlaying(false);
    setIsReady(false);
    // Don't disable audio completely on error - let user try again
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
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-heritage-50 to-heritage-100 dark:from-heritage-900 dark:to-heritage-800 border border-heritage-200 dark:border-heritage-700 rounded-lg p-4 my-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-heritage-600 text-white text-lg">
          🎧
        </div>
        <div>
          <h4 className="font-semibold text-heritage-900 dark:text-heritage-100">
            Audio Tour
          </h4>
          <p className="text-sm text-heritage-600 dark:text-heritage-300">
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
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={handleError}
          preload="metadata"
          crossOrigin="anonymous"
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
          <div className="flex justify-between text-xs text-heritage-500 mt-1">
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
            className="p-2 text-heritage-600 hover:text-heritage-700 transition-colors rounded-full hover:bg-heritage-100"
            style={{ color: '#8b5a3c' }}
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
          className="flex items-center space-x-1 text-heritage-600 hover:text-heritage-700 transition-colors text-sm"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </div>
  );
}