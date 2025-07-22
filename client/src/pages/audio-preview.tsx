import { useState, useRef } from "react";

export default function AudioPreview() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-red-500">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🌴 Florida Historical Explorer
          </h1>
          <p className="text-xl text-orange-100 mb-2">
            Audio Narration Preview - Powered by ElevenLabs AI
          </p>
        </div>

        {/* Main Audio Player Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              🏰 Castillo de San Marcos National Monument
            </h2>
            <p className="text-orange-100 text-lg">
              St. Augustine, Florida • Spanish Colonial Fortress
            </p>
          </div>

          {/* Audio Player */}
          <div className="bg-white/20 rounded-xl p-6 mb-6">
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
            >
              <source src="/uploads/florida-castillo-preview.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>

            {/* Custom Controls */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                onClick={togglePlay}
                className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1H6zM12 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a1 1 0 011.733 0L18 16.28a1 1 0 01-.866 1.5H2.866A1 1 0 012 16.28L12 3.455z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-3 text-white text-sm">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1 bg-white/20 rounded-full h-2">
                <div
                  className="bg-orange-300 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Preview Text */}
          <div className="text-center">
            <p className="text-white text-lg leading-relaxed font-light italic opacity-90">
              "Welcome to Castillo de San Marcos National Monument. Standing sentinel over Matanzas Bay for more than 350 years, this massive star-shaped fortress represents one of America's most remarkable architectural and military achievements..."
            </p>
          </div>
        </div>

        {/* Direct Links */}
        <div className="text-center mb-8">
          <a
            href="/uploads/florida-castillo-preview.mp3"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white/90 hover:bg-white text-orange-600 font-bold py-3 px-6 rounded-xl mr-4 mb-2 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            🎵 Open Audio in New Tab
          </a>
          <a
            href="/uploads/florida-castillo-preview.mp3"
            download
            className="inline-block bg-white/90 hover:bg-white text-orange-600 font-bold py-3 px-6 rounded-xl mb-2 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            📱 Download Audio (436KB)
          </a>
        </div>

        {/* Features */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            🎧 Audio Narration Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 border-l-4 border-orange-300">
              <h4 className="font-bold text-orange-100 mb-2">Professional Voice Quality</h4>
              <p className="text-white/90 text-sm">ElevenLabs Rachel voice optimized for historical education</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border-l-4 border-orange-300">
              <h4 className="font-bold text-orange-100 mb-2">Perfect Length</h4>
              <p className="text-white/90 text-sm">2-3 minute narrations ideal for on-site listening</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border-l-4 border-orange-300">
              <h4 className="font-bold text-orange-100 mb-2">Mobile Optimized</h4>
              <p className="text-white/90 text-sm">Download capability for offline listening during site visits</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border-l-4 border-orange-300">
              <h4 className="font-bold text-orange-100 mb-2">Educational Focus</h4>
              <p className="text-white/90 text-sm">Academic-quality content in accessible audio format</p>
            </div>
          </div>
        </div>

        {/* Back to PNW */}
        <div className="text-center">
          <a
            href="/"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            🌲 Back to Pacific Northwest Explorer
          </a>
        </div>
      </div>
    </div>
  );
}