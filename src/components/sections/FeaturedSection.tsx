import React from 'react';
import { Sparkles, Play, Radio, Tv, Eye, Heart, ArrowUpRight } from 'lucide-react';
import { Product } from '../../types';

interface FeaturedSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onPlayAudio: (product: Product) => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  products,
  onSelectProduct,
  onPlayAudio,
}) => {
  const featured = products.filter(p => p.isFeatured && p.isPublished).slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <section className="py-14 bg-white border-b border-[#EAF8FF]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8FF] text-[#38A9E8] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TUYỂN TẬP XUẤT SẮC</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#24506B] tracking-tight">
              SẢN PHẨM NỔI BẬT
            </h2>
            <p className="text-xs sm:text-sm text-[#405866] mt-1">
              Những tác phẩm media, số phát thanh và dự án số được yêu thích nhất của các bạn học sinh
            </p>
          </div>
        </div>

        {/* Media Grid: Media-First design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((prod) => (
            <div
              key={prod.id}
              onClick={() => {
                if (prod.type === 'audio') {
                  onPlayAudio(prod);
                } else {
                  onSelectProduct(prod);
                }
              }}
              className="group bg-white rounded-3xl overflow-hidden border border-[#EAF8FF] hover:border-[#70C8F3] shadow-card hover:shadow-floating transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Media Visual Area */}
              <div className="relative aspect-16/9 sm:aspect-square w-full bg-slate-100 overflow-hidden">
                <img 
                  src={prod.thumbnail} 
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Type Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-[#24506B] shadow-xs">
                  {prod.type === 'video' && <Tv className="w-3 h-3 text-red-500" />}
                  {prod.type === 'audio' && <Radio className="w-3 h-3 text-[#38A9E8]" />}
                  {prod.type === 'image' && <Sparkles className="w-3 h-3 text-[#FFD76A]" />}
                  {prod.type === 'digital' && <span className="text-[#38A9E8]">💻</span>}
                  <span className="uppercase text-[10px] tracking-wider">
                    {prod.type === 'video' ? 'Đông Hội TV' : prod.type === 'audio' ? 'Phát thanh số' : 'Tác phẩm nhí'}
                  </span>
                </div>

                {/* Star featured badge */}
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFD76A] text-[#24506B] shadow-xs">
                  ★ NỔI BẬT
                </span>

                {/* Hover Play / View Overlay */}
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="w-12 h-12 rounded-full bg-white text-[#38A9E8] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {prod.type === 'audio' ? (
                      <Radio className="w-5 h-5 text-[#38A9E8]" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </span>
                </div>
              </div>

              {/* Minimal Text Info (Media-first principle) */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2 bg-[#F6FCFF]">
                <div>
                  <h3 className="text-sm font-bold text-[#24506B] group-hover:text-[#38A9E8] transition-colors line-clamp-2 leading-snug">
                    {prod.title}
                  </h3>
                  <p className="text-xs text-[#405866] line-clamp-1 mt-1 font-normal">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EAF8FF] flex items-center justify-between text-xs text-[#405866]">
                  <span className="font-semibold text-[#24506B] truncate max-w-[130px]">
                    {prod.studentName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#EAF8FF] text-[#38A9E8] font-bold text-[11px] shrink-0">
                    Lớp {prod.studentClass}
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
