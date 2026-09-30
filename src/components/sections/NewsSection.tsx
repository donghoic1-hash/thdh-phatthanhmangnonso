import React from 'react';
import { Newspaper, Camera, Calendar, User, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { Product } from '../../types';

interface NewsSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ products, onSelectProduct }) => {
  const newsList = products.filter(p => p.type === 'news' && p.isPublished);

  if (newsList.length === 0) return null;

  return (
    <section id="section-news" className="py-14 bg-white border-b border-[#EAF8FF]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8FF] text-[#38A9E8] text-xs font-bold mb-2">
              <Newspaper className="w-3.5 h-3.5" />
              <span>CHUYÊN ĐỀ TIN TỨC SỰ KIỆN</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#24506B] tracking-tight">
              BẢN TIN NHANH HỌC ĐƯỜNG
            </h2>
            <p className="text-xs sm:text-sm text-[#405866] mt-1">
              Phóng sự ảnh, tin tức hoạt động Đội, phong trào thi đua và các khoảnh khắc đáng nhớ của học sinh Đông Hội
            </p>
          </div>
        </div>

        {/* News Grid: Media-First with Multi-image indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((item) => {
            const imageCount = item.images && item.images.length > 0 ? item.images.length : 1;

            return (
              <article
                key={item.id}
                onClick={() => onSelectProduct(item)}
                className="group bg-[#F6FCFF] rounded-3xl overflow-hidden border border-[#EAF8FF] hover:border-[#38A9E8] shadow-card hover:shadow-floating transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Visual Area */}
                <div className="relative aspect-16/9 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Multiple image count pill */}
                  {imageCount > 1 && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1 shadow-md">
                      <Layers className="w-3.5 h-3.5 text-[#FFD76A]" />
                      <span>{imageCount} hình ảnh</span>
                    </span>
                  )}

                  {/* Tag badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#38A9E8] text-white shadow-xs uppercase tracking-wider flex items-center gap-1">
                    <Newspaper className="w-3 h-3" />
                    <span>BẢN TIN NHANH</span>
                  </span>
                </div>

                {/* Article Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                      {item.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#38A9E8]" />
                          <span>{item.createdAt}</span>
                        </span>
                      )}
                      <span>•</span>
                      <span className="text-[#38A9E8] font-bold">Lớp {item.studentClass}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#24506B] group-hover:text-[#38A9E8] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#405866] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EAF8FF] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#24506B] flex items-center gap-1 truncate max-w-[150px]">
                      <User className="w-3.5 h-3.5 text-[#38A9E8]" />
                      <span className="truncate">{item.studentName}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 font-bold text-[#38A9E8] group-hover:translate-x-1 transition-transform">
                      <span>Đọc bài viết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
