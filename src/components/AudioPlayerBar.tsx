import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  X, 
  Music, 
  Radio, 
  User, 
  Share2 
} from 'lucide-react';
import { Product } from '../types';

interface AudioPlayerBarProps {
  currentTrack: Product | null;
  onClose: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ currentTrack, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(240); // default fallback duration 4m
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (currentTrack) {
      setIsPlaying(true);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => {
          console.log('Autoplay restriction or audio format:', e);
        });
      }
    }
  }, [currentTrack]);

  // Fallback timer simulation if audio URL cannot be played directly
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && (!audioRef.current || audioRef.current.paused)) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) return 0;
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  if (!currentTrack) return null;

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#70C8F3]/50 shadow-2xl py-3 px-4">
      {/* Hidden HTML5 Audio Element */}
      {currentTrack.audioUrl && (
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 240)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Track Information & 1:1 Cover */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#70C8F3] shadow-xs aspect-square">
            <img 
              src={currentTrack.thumbnail || './assets/logo_dong_hoi.svg'} 
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-0.5">
                <span className="w-1 bg-[#FFD76A] rounded-full h-3 animate-pulse"></span>
                <span className="w-1 bg-[#FFD76A] rounded-full h-5 animate-pulse delay-75"></span>
                <span className="w-1 bg-[#FFD76A] rounded-full h-2 animate-pulse delay-150"></span>
              </div>
            )}
          </div>

          <div className="overflow-hidden max-w-xs sm:max-w-sm md:max-w-md">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-[#EAF8FF] text-[10px] font-bold text-[#38A9E8] uppercase tracking-wide">
                📻 MĂNG NON SỐ
              </span>
              <span className="text-xs text-[#24506B] font-semibold truncate">
                Lớp {currentTrack.studentClass}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#24506B] truncate">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-[#405866] truncate flex items-center gap-1">
              <User className="w-3 h-3 text-[#38A9E8]" />
              <span>Phát thanh viên: {currentTrack.studentName}</span>
            </p>
          </div>
        </div>

        {/* Center: Controls & Scrubber */}
        <div className="flex flex-col items-center gap-1 w-full sm:w-1/2 md:w-2/5">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#38A9E8] hover:bg-[#24506B] text-white flex items-center justify-center shadow-md transition-all active:scale-95"
              aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>
          </div>

          <div className="w-full flex items-center gap-2 text-xs text-[#405866] font-medium">
            <span>{formatTime(currentTime)}</span>
            <input 
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-[#EAF8FF] rounded-lg appearance-none cursor-pointer accent-[#38A9E8]"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Close */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full text-[#24506B] hover:bg-[#EAF8FF] transition-colors"
            aria-label="Bật/Tắt âm thanh"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-[#38A9E8]" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Đóng trình phát"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
