import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Eye, Heart, Layers } from 'lucide-react';
import { Product } from '../../types';

interface GallerySectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ products, onSelectProduct }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Filter products for gallery (images, galleries, digital art)
  const galleryItems = products.filter(
    p => (p.type === 'image' || p.type === 'gallery' || p.type === 'digital') && p.isPublished
  );

  const filteredItems = activeFilter === 'all'
    ? galleryItems
    : galleryItems.filter(p => {
        if (activeFilter === 'mask') return p.competitionId === 'comp-01' || p.title.toLowerCase().includes('mặt nạ');
        if (activeFilter === 'digital') return p.type === 'digital' || p.competitionId === 'comp-02';
        if (activeFilter === 'tet') return p.competitionId === 'comp-04' || p.title.toLowerCase().includes('tết');
        return true;
      });

  if (galleryItems.length === 0) return null;

  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8FF] text-[#38A9E8] text-xs font-bold mb-2">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>TRIỂN LÃM MỸ THUẬT & SẢNG TẠO</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#24506B] tracking-tight">
              THƯ VIỆN HÌNH ẢNH & SẢN PHẨM
            </h2>
            <p className="text-xs sm:text-sm text-[#405866] mt-1">
              Trưng bày các tác phẩm mặt nạ Trung thu, tranh vẽ Tết, đồ họa số và album hoạt động
            </p>
          </div>

          {/* Gallery Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-[#38A9E8] text-white shadow-xs'
                  : 'bg-[#F6FCFF] text-[#24506B] hover:bg-[#EAF8FF]'
              }`}
            >
              Tất cả ({galleryItems.length})
            </button>
            <button
              onClick={() => setActiveFilter('mask')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === 'mask'
                  ? 'bg-[#38A9E8] text-white shadow-xs'
                  : 'bg-[#F6FCFF] text-[#24506B] hover:bg-[#EAF8FF]'
              }`}
            >
              Mặt nạ Trung thu
            </button>
            <button
              onClick={() => setActiveFilter('digital')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === 'digital'
                  ? 'bg-[#38A9E8] text-white shadow-xs'
                  : 'bg-[#F6FCFF] text-[#24506B] hover:bg-[#EAF8FF]'
              }`}
            >
              Sáng tạo số (Scratch)
            </button>
            <button
              onClick={() => setActiveFilter('tet')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === 'tet'
                  ? 'bg-[#38A9E8] text-white shadow-xs'
                  : 'bg-[#F6FCFF] text-[#24506B] hover:bg-[#EAF8FF]'
              }`}
            >
              Tết trong mắt em
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const hasMultipleImages = item.images && item.images.length > 1;

            return (
              <div
                key={item.id}
                onClick={() => onSelectProduct(item)}
                className="group relative bg-[#F6FCFF] rounded-3xl overflow-hidden border border-[#EAF8FF] hover:border-[#70C8F3] shadow-card hover:shadow-floating transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Image Display Area */}
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Album indicator if multiple images */}
                  {hasMultipleImages && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>{item.images?.length} ảnh</span>
                    </span>
                  )}

                  {/* Tag badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-[#24506B] backdrop-blur-xs">
                    {item.type === 'digital' ? '💻 Game / Đồ họa' : item.type === 'gallery' ? '🖼️ Album' : '🎨 Tác phẩm'}
                  </span>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 rounded-xl bg-white text-[#24506B] text-xs font-bold shadow-md flex items-center gap-1.5 group-hover:scale-105 transition-transform">
                      <Eye className="w-4 h-4 text-[#38A9E8]" />
                      <span>Xem chi tiết</span>
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <h4 className="text-sm font-bold text-[#24506B] group-hover:text-[#38A9E8] transition-colors line-clamp-1">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-[#405866]">
                    <span className="font-semibold truncate max-w-[120px]">
                      {item.studentName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#EAF8FF] text-[#38A9E8] font-bold text-[11px]">
                      Lớp {item.studentClass}
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
