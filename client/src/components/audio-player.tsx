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
    console.log('🎵 AUDIO PLAYER: Checking audio availability for location', locationId);
    fetch(audioUrl, { method: 'HEAD' })
      .then(response => {
        console.log('🎵 AUDIO PLAYER: HEAD response:', response.status, response.ok);
        setHasAudio(response.ok);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log('🎵 AUDIO PLAYER: Error checking audio:', error);
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
    console.log('🎵 AUDIO PLAYER: Showing loading state for location', locationId);
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

  console.log('🎵 AUDIO PLAYER: Final render state:', { hasAudio, locationId, locationName });

  if (!hasAudio) {
    console.log('🎵 AUDIO PLAYER: No audio available, hiding component');
    return null;
  }

  console.log('🎵 AUDIO PLAYER: Rendering full audio player component');

  return (
    <div style={{ border: '2px solid red', padding: '16px', margin: '16px 0', background: 'yellow' }}>
      <h3 style={{ color: 'black', fontSize: '18px', fontWeight: 'bold' }}>
        🎧 AUDIO PLAYER COMPONENT IS RENDERING
      </h3>
      <p style={{ color: 'black' }}>Location: {locationName} (ID: {locationId})</p>
      <p style={{ color: 'black' }}>Has Audio: {hasAudio ? 'YES' : 'NO'}</p>
      
      {/* Simple HTML Audio Controls Test */}
      <div style={{ background: 'white', padding: '10px', border: '1px solid black', margin: '10px 0' }}>
        <h4 style={{ color: 'black', margin: '0 0 10px 0' }}>Simple HTML Audio Test:</h4>
        <audio 
          controls 
          src={audioUrl}
          style={{ width: '100%' }}
        />
      </div>
      
      {/* Custom Controls Test */}
      <div style={{ background: 'white', padding: '10px', border: '1px solid black', margin: '10px 0' }}>
        <h4 style={{ color: 'black', margin: '0 0 10px 0' }}>Custom Controls Test:</h4>
        <button 
          onClick={togglePlay}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        
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
      </div>
      
      <Card className={cn("w-full bg-gradient-to-r from-heritage-50 to-heritage-100 dark:from-heritage-900 dark:to-heritage-800 border-heritage-200 dark:border-heritage-700", className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-heritage-600 text-white">
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

          {/* Main Controls */}
          <div className="flex items-center space-x-3 mb-3">
            <Button
              onClick={togglePlay}
              size="sm"
              className="bg-heritage-600 hover:bg-heritage-700 text-white"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <div className="flex-1">
              {/* Progress Bar */}
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-heritage-200 rounded-lg appearance-none cursor-pointer dark:bg-heritage-700"
              />
              <div className="flex justify-between text-xs text-heritage-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleMute}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-heritage-600"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-heritage-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <a
              href={audioUrl}
              download={`${locationName}-audio-tour.mp3`}
              className="flex items-center space-x-1 text-heritage-600 hover:text-heritage-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}