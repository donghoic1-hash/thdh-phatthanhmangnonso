import React from 'react';
import { Radio, Play, Clock, User, Volume2, Sparkles } from 'lucide-react';
import { Product } from '../../types';

interface AudioSectionProps {
  products: Product[];
  currentTrackId?: string;
  onPlayAudio: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

export const AudioSection: React.FC<AudioSectionProps> = ({
  products,
  currentTrackId,
  onPlayAudio,
  onOpenDetails,
}) => {
  const audioTracks = products.filter(p => p.type === 'audio' && p.isPublished);

  if (audioTracks.length === 0) return null;

  return (
    <section className="py-14 bg-[#F6FCFF] border-b border-[#EAF8FF]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8FF] text-[#38A9E8] text-xs font-bold mb-2">
              <Radio className="w-3.5 h-3.5" />
              <span>CHƯƠNG TRÌNH PHÁT THANH HỌC ĐƯỜNG</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#24506B] tracking-tight">
              PHÁT THANH MĂNG NON SỐ – AUDIO
            </h2>
            <p className="text-xs sm:text-sm text-[#405866] mt-1">
              Âm vang tiếng nói măng non, câu chuyện đẹp mỗi tuần và giai điệu tuổi thơ của học sinh Đông Hội
            </p>
          </div>
        </div>

        {/* Audio Grid: 1:1 ratio strictly respected */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audioTracks.map((track) => {
            const isCurrentPlaying = currentTrackId === track.id;

            return (
              <div
                key={track.id}
                className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 shadow-card hover:shadow-floating flex flex-col ${
                  isCurrentPlaying ? 'border-[#38A9E8] ring-2 ring-[#38A9E8]/20' : 'border-[#EAF8FF] hover:border-[#70C8F3]'
                }`}
              >
                {/* 1:1 Cover Image */}
                <div 
                  onClick={() => onPlayAudio(track)}
                  className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer"
                >
                  <img 
                    src={track.thumbnail} 
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient bottom shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-between p-4">
                    {/* Top tags */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-[#24506B] backdrop-blur-xs flex items-center gap-1">
                        <Radio className="w-3 h-3 text-[#38A9E8]" />
                        <span>SỐ RADIO</span>
                      </span>
                      {track.duration && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/50 text-white backdrop-blur-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{track.duration}</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Voice info over image */}
                    <div className="text-white">
                      <p className="text-xs font-medium text-slate-200">Phát thanh viên</p>
                      <h4 className="text-sm font-bold truncate drop-shadow-sm">{track.studentName}</h4>
                    </div>
                  </div>

                  {/* Center Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      className="w-14 h-14 rounded-full bg-[#38A9E8] hover:bg-[#24506B] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                      aria-label="Phát số phát thanh này"
                    >
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </button>
                  </div>

                  {/* Playing wave animation indicator if active */}
                  {isCurrentPlaying && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-[#38A9E8] text-white flex items-center gap-1 shadow-md">
                      <span className="w-1 h-3 bg-white rounded-full animate-bounce"></span>
                      <span className="w-1 h-4 bg-white rounded-full animate-bounce delay-100"></span>
                      <span className="w-1 h-2 bg-white rounded-full animate-bounce delay-200"></span>
                    </div>
                  )}
                </div>

                {/* Minimal text metadata */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 
                      onClick={() => onOpenDetails(track)}
                      className="text-base font-bold text-[#24506B] group-hover:text-[#38A9E8] transition-colors line-clamp-2 cursor-pointer"
                    >
                      {track.title}
                    </h3>
                    <p className="text-xs text-[#405866] line-clamp-2 mt-1">
                      {track.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-[#EAF8FF] text-[#38A9E8] font-bold text-xs">
                      Lớp {track.studentClass}
                    </span>

                    <button
                      onClick={() => onPlayAudio(track)}
                      className="text-xs font-bold text-[#38A9E8] hover:text-[#24506B] flex items-center gap-1 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isCurrentPlaying ? 'Đang phát' : 'Nghe ngay'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
