import React from 'react';
import { Tv, Play, Clock, Youtube, Facebook, ExternalLink } from 'lucide-react';
import { Product } from '../../types';

interface VideoSectionProps {
  products: Product[];
  onSelectVideo: (product: Product) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ products, onSelectVideo }) => {
  const videoList = products.filter(p => p.type === 'video' && p.isPublished);

  if (videoList.length === 0) return null;

  return (
    <section className="py-14 bg-white border-b border-[#EAF8FF]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8FF] text-[#38A9E8] text-xs font-bold mb-2">
              <Tv className="w-3.5 h-3.5" />
              <span>TRUYỀN HÌNH HỌC ĐƯỜNG ĐÔNG HỘI</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#24506B] tracking-tight">
              ĐÔNG HỘI TV – VIDEO
            </h2>
            <p className="text-xs sm:text-sm text-[#405866] mt-1">
              Phóng sự, bản tin thời sự học sinh và những thước phim hoạt động sôi nổi của Liên đội
            </p>
          </div>
        </div>

        {/* Video Grid: 16:9 aspect ratio strictly respected */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoList.map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="group bg-white rounded-3xl overflow-hidden border border-[#EAF8FF] hover:border-[#70C8F3] shadow-card hover:shadow-floating transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* 16:9 Video Thumbnail Area */}
              <div className="relative aspect-16/9 w-full bg-slate-900 overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Duration Badge */}
                {video.duration && (
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/75 text-white backdrop-blur-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#FFD76A]" />
                    <span>{video.duration}</span>
                  </span>
                )}

                {/* Platform Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600 text-white shadow-xs uppercase tracking-wider flex items-center gap-1">
                    <Tv className="w-3 h-3" />
                    <span>ĐÔNG HỘI TV</span>
                  </span>
                  {video.youtubeUrl && (
                    <span className="p-1 rounded-full bg-white/90 text-red-600">
                      <Youtube className="w-3 h-3" />
                    </span>
                  )}
                  {video.facebookUrl && (
                    <span className="p-1 rounded-full bg-white/90 text-[#1877F2]">
                      <Facebook className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full bg-[#38A9E8] hover:bg-[#24506B] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </span>
                </div>
              </div>

              {/* Minimal Text Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#F6FCFF]">
                <div>
                  <h3 className="text-base font-bold text-[#24506B] group-hover:text-[#38A9E8] transition-colors line-clamp-2 leading-snug">
                    {video.title}
                  </h3>
                  <p className="text-xs text-[#405866] line-clamp-2 mt-1">
                    {video.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EAF8FF] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#24506B] truncate max-w-[150px]">
                    Thực hiện: {video.studentName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#EAF8FF] text-[#38A9E8] font-bold text-[11px]">
                    Lớp {video.studentClass}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
