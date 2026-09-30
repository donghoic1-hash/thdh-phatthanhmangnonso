import React from 'react';
import { Trophy, ArrowRight, Palette, Cpu, Mic, Sparkles, Radio, Calendar, Users } from 'lucide-react';
import { Competition, Product } from '../../types';

interface CompetitionsSectionProps {
  competitions: Competition[];
  products: Product[];
  onSelectCompetition: (comp: Competition) => void;
}

export const CompetitionsSection: React.FC<CompetitionsSectionProps> = ({
  competitions,
  products,
  onSelectCompetition,
}) => {
  const publishedCompetitions = competitions.filter(c => c.isPublished);

  // Helper icon selector
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Palette': return <Palette className="w-5 h-5 text-[#38A9E8]" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-[#38A9E8]" />;
      case 'Mic': return <Mic className="w-5 h-5 text-[#38A9E8]" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-[#FFD76A]" />;
      case 'Radio': return <Radio className="w-5 h-5 text-[#38A9E8]" />;
      default: return <Trophy className="w-5 h-5 text-[#FFD76A]" />;
    }
  };

  return (
    <section className="py-14 bg-[#F6FCFF] border-b border-[#EAF8FF]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8FF] text-[#38A9E8] text-xs font-bold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>SÂN CHƠI TRUYỀN THÔNG & SÁNG TẠO</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#24506B] tracking-tight">
              CÁC CUỘC THI CỦA LIÊN ĐỘI
            </h2>
            <p className="text-xs sm:text-sm text-[#405866] mt-1">
              Khám phá các cuộc thi phát huy tài năng, nghệ thuật số và giọng đọc truyền cảm của thiếu nhi Đông Hội
            </p>
          </div>
        </div>

        {/* Competitions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedCompetitions.map((comp) => {
            const count = products.filter(
              p => (p.competitionId === comp.id || p.competitionId === comp.slug) && p.isPublished
            ).length;

            return (
              <div
                key={comp.id}
                onClick={() => onSelectCompetition(comp)}
                className="group bg-white rounded-3xl overflow-hidden border border-[#EAF8FF] hover:border-[#38A9E8] shadow-card hover:shadow-floating transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Visual Banner */}
                <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                  <img 
                    src={comp.banner} 
                    alt={comp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs">
                        {getIcon(comp.icon)}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFD76A] text-[#24506B] uppercase tracking-wide">
                        {comp.status === 'active' ? 'ĐANG DIỄN RA' : 'TỔNG KẾT'}
                      </span>
                    </div>

                    <div className="text-white">
                      <span className="text-[11px] text-slate-200 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {comp.date || 'Học kỳ I'}
                      </span>
                      <h3 className="text-lg font-black text-white line-clamp-1 drop-shadow-sm mt-0.5">
                        {comp.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs sm:text-sm text-[#405866] line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>

                  <div className="pt-3 border-t border-[#EAF8FF] flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38A9E8]">
                      <Users className="w-3.5 h-3.5" />
                      <span>{count > 0 ? `${count} bài dự thi` : 'Đang nhận bài'}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#24506B] group-hover:text-[#38A9E8] transition-colors">
                      <span>Xem sản phẩm</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
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
