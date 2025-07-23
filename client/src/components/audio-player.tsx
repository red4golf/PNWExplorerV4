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

  const audioUrl = `/api/locations/${locationId}/audio`;

  useEffect(() => {
    fetch(audioUrl, { method: 'HEAD' })
      .then(response => {
        setHasAudio(response.ok);
        setIsLoading(false);
      })
      .catch(() => {
        setHasAudio(false);
        setIsLoading(false);
      });
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      audioRef.current.muted = newMutedState;
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

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
        style={{ display: 'none' }}
      />

      {/* Main Controls */}
      <div className="flex items-center space-x-3 mb-3">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-heritage-600 hover:bg-heritage-700 text-white transition-colors shadow-lg border-2 border-white"
          style={{ backgroundColor: '#8b5a3c' }}
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
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #8b5a3c 0%, #8b5a3c ${(currentTime / (duration || 1)) * 100}%, #d1d5db ${(currentTime / (duration || 1)) * 100}%, #d1d5db 100%)`,
              outline: 'none'
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
            min={0}
            max={1}
            step={0.1}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-0.5 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #8b5a3c 0%, #8b5a3c ${volume * 100}%, #d1d5db ${volume * 100}%, #d1d5db 100%)`,
              outline: 'none'
            }}
          />
        </div>

        <a
          href={audioUrl}
          download={`${locationName}-audio-tour.mp3`}
          className="flex items-center space-x-1 text-heritage-600 hover:text-heritage-700 transition-colors text-sm"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </a>
      </div>
    </div>
  );
}