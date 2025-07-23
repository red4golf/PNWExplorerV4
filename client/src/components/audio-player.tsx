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

  // Force render with visible styles to debug
  return (
    <div style={{ 
      border: '3px solid blue', 
      padding: '20px', 
      margin: '20px 0', 
      backgroundColor: 'lightblue',
      minHeight: '200px'
    }}>
      <h2 style={{ color: 'black', fontSize: '20px', marginBottom: '20px' }}>
        🎧 Audio Player Debug Mode
      </h2>
      
      {/* Native HTML Audio with Controls */}
      <div style={{ marginBottom: '20px', backgroundColor: 'white', padding: '10px' }}>
        <h3 style={{ color: 'black', margin: '0 0 10px 0' }}>Native HTML Audio:</h3>
        <audio controls style={{ width: '100%' }} src={audioUrl} />
      </div>
      
      {/* Simple Button Test */}
      <div style={{ marginBottom: '20px', backgroundColor: 'white', padding: '10px' }}>
        <h3 style={{ color: 'black', margin: '0 0 10px 0' }}>Simple Button Test:</h3>
        <button 
          onClick={() => {
            console.log('Button clicked!');
            if (audioRef.current) {
              if (isPlaying) {
                audioRef.current.pause();
              } else {
                audioRef.current.play();
              }
            }
          }}
          style={{ 
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: isPlaying ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isPlaying ? '⏸️ PAUSE' : '▶️ PLAY'}
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
      
      {/* Component Library Test */}
      <div style={{ backgroundColor: 'white', padding: '10px' }}>
        <h3 style={{ color: 'black', margin: '0 0 10px 0' }}>Component Library Test:</h3>
        <Card style={{ backgroundColor: 'lightyellow' }}>
          <CardContent style={{ padding: '16px' }}>
            <Button
              onClick={togglePlay}
              style={{ 
                backgroundColor: '#007bff',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Component Button: {isPlaying ? 'Pause' : 'Play'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}