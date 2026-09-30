import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  Calendar, 
  Users, 
  Palette, 
  Cpu, 
  Mic, 
  Sparkles, 
  Radio, 
  Play, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Competition, Product } from '../types';

interface CompetitionModalProps {
  competition: Competition | null;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const CompetitionModal: React.FC<CompetitionModalProps> = ({
  competition,
  products,
  onClose,
  onSelectProduct,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');

  if (!competition) return null;

  // Filter products belonging to this competition
  const contestProducts = products.filter(
    p => p.competitionId === competition.id || p.competitionId === competition.slug
  );

  // Get distinct classes
  const classes = Array.from(new Set(contestProducts.map(p => p.studentClass))).filter(Boolean);

  const filteredProducts = selectedClass === 'all' 
    ? contestProducts 
    : contestProducts.filter(p => p.studentClass === selectedClass);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Area */}
        <div className="relative h-48 sm:h-64 w-full bg-slate-800 shrink-0">
          <img 
            src={competition.banner} 
            alt={competition.title} 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/30 backdrop-blur-md hover:bg-white text-white hover:text-[#24506B] flex items-center justify-center transition-all shadow-md"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#FFD76A] text-[#24506B] uppercase tracking-wider">
                🏆 CUỘC THI LIÊN ĐỘI
              </span>
              <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full font-medium">
                {competition.date || 'Năm học 2026-2027'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black drop-shadow-md">
              {competition.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-3xl">
              {competition.description}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-[#EAF8FF] px-6 py-3 border-b border-[#70C8F3]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#24506B]">
            <Filter className="w-4 h-4 text-[#38A9E8]" />
            <span>Lọc theo lớp ({filteredProducts.length} tác phẩm):</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedClass('all')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                selectedClass === 'all'
                  ? 'bg-[#38A9E8] text-white'
                  : 'bg-white text-[#24506B] hover:bg-white/80'
              }`}
            >
              Tất cả
            </button>
            {classes.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  selectedClass === cls
                    ? 'bg-[#38A9E8] text-white'
                    : 'bg-white text-[#24506B] hover:bg-white/80'
                }`}
              >
                Lớp {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="overflow-y-auto flex-1 p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-[#405866] space-y-3">
              <Trophy className="w-12 h-12 text-[#70C8F3] mx-auto opacity-50" />
              <p className="text-sm font-semibold">Chưa có tác phẩm nào thuộc bộ lọc này.</p>
              <p className="text-xs text-gray-400">Các bài dự thi xuất sắc đang được cập nhật!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#EAF8FF] hover:border-[#38A9E8] shadow-sm hover:shadow-card transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-16/9 w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={prod.thumbnail} 
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-[#24506B] backdrop-blur-xs">
                      {prod.type === 'video' && '📺 Video'}
                      {prod.type === 'audio' && '📻 Audio'}
                      {prod.type === 'image' && '🎨 Tác phẩm'}
                      {prod.type === 'digital' && '💻 Đồ họa/Code'}
                      {prod.type === 'gallery' && '🖼️ Album'}
                    </span>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="w-10 h-10 rounded-full bg-white text-[#38A9E8] flex items-center justify-center shadow-md">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#24506B] group-hover:text-[#38A9E8] transition-colors line-clamp-2">
                        {prod.title}
                      </h4>
                      <p className="text-xs text-[#405866] line-clamp-1 mt-1">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-[#405866]">
                      <span className="font-semibold text-[#24506B]">
                        Học sinh: {prod.studentName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#EAF8FF] text-[#38A9E8] font-bold text-[11px]">
                        Lớp {prod.studentClass}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
