import React, { useEffect, useRef } from 'react';
import { Radio, Tv, Sparkles, ArrowRight, Volume2, Award, Play, Image as ImageIcon } from 'lucide-react';
import { SiteSettings, Product } from '../../types';
import gsap from 'gsap';

interface BannerHeroProps {
  settings: SiteSettings;
  latestAudio?: Product;
  onPlayAudio?: (product: Product) => void;
  onExploreClick?: () => void;
}

export const BannerHero: React.FC<BannerHeroProps> = ({
  settings,
  latestAudio,
  onPlayAudio,
  onExploreClick,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const bannerBillboardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(bannerBillboardRef.current, {
        scale: 0.96,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
      gsap.from(badgeRef.current, {
        y: -15,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      });
      gsap.from(titleRef.current, {
        y: 25,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out',
      });
      gsap.from(cardRef.current, {
        scale: 0.92,
        opacity: 0,
        duration: 1.1,
        delay: 0.4,
        ease: 'back.out(1.2)',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative overflow-hidden pt-6 pb-14 md:pt-10 md:pb-20 bg-gradient-to-b from-[#EAF8FF] via-[#F6FCFF] to-white border-b border-[#EAF8FF]"
    >
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#70C8F3]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#38A9E8]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 space-y-8">
        {/* 1. GRAND COVER BANNER / ẢNH BÌA WEBSITE TRANG CHỦ */}
        <div 
          ref={bannerBillboardRef}
          className="relative w-full rounded-3xl overflow-hidden shadow-floating border-2 border-[#70C8F3]/50 bg-slate-900 group"
        >
          {/* Cover image container */}
          <div className="relative aspect-[21/9] sm:aspect-[24/9] md:aspect-[3/1] max-h-[360px] w-full overflow-hidden">
            <img 
              src={settings.coverUrl || './assets/banner_hero_main.svg'} 
              alt="Ảnh bìa Trường Tiểu học Đông Hội"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = './assets/banner_hero_main.svg';
              }}
            />
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent hidden md:block" />

            {/* Banner Floating Metadata Overlay */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD76A] text-[#24506B] text-[10px] sm:text-xs font-black shadow-md">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>ẢNH BÌA CHÍNH THỨC • {settings.schoolName || 'TRƯỜNG TIỂU HỌC ĐÔNG HỘI'}</span>
                </div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white drop-shadow-md tracking-tight">
                  {settings.siteName || 'PHÁT THANH MĂNG NON SỐ'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 line-clamp-1 italic max-w-xl">
                  {settings.tagline || 'Nơi những thanh âm trong trẻo của tuổi thơ cất cánh.'}
                </p>
              </div>

              {latestAudio && onPlayAudio && (
                <button
                  onClick={() => onPlayAudio(latestAudio)}
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-[#38A9E8] hover:bg-white hover:text-[#24506B] text-white text-xs font-bold shadow-lg transition-all active:scale-95 shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Nghe số mới: {latestAudio.title.slice(0, 24)}...</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. EDITORIAL INTRO & INTERACTIVE SHOWCASE ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2">
          {/* Left Column: Headlines & Editorial Intro */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div 
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#70C8F3] text-xs font-bold text-[#24506B] shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#38A9E8] animate-ping"></span>
              <span className="text-[#38A9E8] uppercase tracking-wider">TẠP CHÍ SỐ & KHÔNG GIAN TRUYỀN THÔNG HỌC ĐƯỜNG</span>
              <span className="px-1.5 py-0.5 rounded bg-[#FFD76A] text-[#24506B] text-[10px]">2026</span>
            </div>

            <h1 
              ref={titleRef}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#24506B] tracking-tight leading-[1.2]"
            >
              Không Gian Truyền Thông Số <br className="hidden sm:inline" />
              <span className="text-[#38A9E8]">Tuổi Thơ Đông Hội</span>
            </h1>

            <p className="text-sm sm:text-base text-[#405866] max-w-xl leading-relaxed mx-auto lg:mx-0">
              Trang thông tin điện tử & tạp chí số trưng bày các bản tin Đông Hội TV, các số phát thanh học đường, sáng tạo công nghệ và tác phẩm nghệ thuật xuất sắc của học sinh Trường Tiểu học Đông Hội.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
              {latestAudio && onPlayAudio && (
                <button
                  onClick={() => onPlayAudio(latestAudio)}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#38A9E8] hover:bg-[#24506B] text-white font-bold text-sm shadow-card transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>NGHE SỐ PHÁT THANH MỚI</span>
                </button>
              )}

              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-[#EAF8FF] border border-[#70C8F3] text-[#24506B] font-bold text-sm shadow-xs transition-all hover:border-[#38A9E8]"
              >
                <span>Xem Sản Phẩm Nổi Bật</span>
                <ArrowRight className="w-4 h-4 text-[#38A9E8]" />
              </button>
            </div>

            {/* Media Stats Pills */}
            <div className="pt-4 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0">
              <div className="p-3 bg-white/80 backdrop-blur-xs rounded-2xl border border-[#EAF8FF] text-center shadow-xs">
                <span className="block text-xl md:text-2xl font-black text-[#38A9E8]">100%</span>
                <span className="text-[11px] font-bold text-[#24506B]">Sản phẩm nhí</span>
              </div>
              <div className="p-3 bg-white/80 backdrop-blur-xs rounded-2xl border border-[#EAF8FF] text-center shadow-xs">
                <span className="block text-xl md:text-2xl font-black text-[#38A9E8]">05+</span>
                <span className="text-[11px] font-bold text-[#24506B]">Hội thi lớn</span>
              </div>
              <div className="p-3 bg-white/80 backdrop-blur-xs rounded-2xl border border-[#EAF8FF] text-center shadow-xs">
                <span className="block text-xl md:text-2xl font-black text-[#38A9E8]">4K / HD</span>
                <span className="text-[11px] font-bold text-[#24506B]">Đông Hội TV</span>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Interactive Podcast Card */}
          <div ref={cardRef} className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-[#70C8F3] rounded-3xl transform rotate-2 scale-95 opacity-25 blur-xs"></div>
              
              <div className="relative bg-white rounded-3xl p-5 border-2 border-[#70C8F3]/60 shadow-floating space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF8FF] text-[#38A9E8] flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    <span>PHÁT THANH MĂNG NON</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD76A] text-[#24506B]">
                    SỐ MỚI
                  </span>
                </div>

                {latestAudio && (
                  <div 
                    onClick={() => onPlayAudio && onPlayAudio(latestAudio)}
                    className="p-4 rounded-2xl bg-[#F6FCFF] border border-[#EAF8FF] hover:border-[#38A9E8] transition-all cursor-pointer group space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[#70C8F3] aspect-square relative">
                        <img src={latestAudio.thumbnail} alt={latestAudio.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 fill-white text-white" />
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-bold text-[#38A9E8] uppercase">PHÁT THANH VIÊN: {latestAudio.studentName}</span>
                        <h4 className="text-sm font-bold text-[#24506B] line-clamp-2 group-hover:text-[#38A9E8] transition-colors">
                          {latestAudio.title}
                        </h4>
                        <span className="text-[11px] text-[#405866]">Lớp {latestAudio.studentClass} • {latestAudio.duration || '04:30'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
