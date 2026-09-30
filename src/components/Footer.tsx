import React from 'react';
import { SiteSettings } from '../types';
import { Radio, Heart, Sparkles, Youtube, Facebook, ShieldCheck } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  onNavigateAdmin: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigateAdmin, onNavigateSection }) => {
  const scrollTo = (id: string) => {
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <footer className="bg-white border-t border-[#EAF8FF] mt-16 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#EAF8FF]">
          {/* Col 1: Identity & School */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#EAF8FF] p-1 border border-[#70C8F3] flex items-center justify-center shrink-0">
                <img 
                  src={settings.logoUrl || './assets/logo_dong_hoi.svg'} 
                  alt={settings.schoolName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = './assets/logo_dong_hoi.svg';
                  }}
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#24506B]">
                  {settings.schoolName || 'TRƯỜNG TIỂU HỌC ĐÔNG HỘI'}
                </h3>
                <p className="text-xs text-[#38A9E8] font-semibold tracking-wide">
                  LIÊN ĐỘI THIẾU NIÊN TIỀN PHONG HỒ CHÍ MINH
                </p>
              </div>
            </div>

            <p className="text-sm text-[#405866] leading-relaxed max-w-md">
              {settings.tagline || 'Nơi những thanh âm trong trẻo của tuổi thơ cất cánh.'} Không gian trưng bày và lưu giữ các tác phẩm truyền thông số, audio phát thanh, video phóng sự và nghệ thuật sáng tạo của học sinh Đông Hội.
            </p>

            <div className="flex items-center gap-3 pt-1">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#EAF8FF] text-[#38A9E8] flex items-center justify-center hover:bg-[#38A9E8] hover:text-white transition-all shadow-xs"
                  aria-label="Facebook Trường Đông Hội"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#EAF8FF] text-[#38A9E8] flex items-center justify-center hover:bg-[#38A9E8] hover:text-white transition-all shadow-xs"
                  aria-label="Kênh YouTube Đông Hội TV"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Channels - Chuyên mục số chính */}
          <div>
            <h4 className="text-sm font-bold text-[#24506B] uppercase tracking-wider mb-3">
              Chuyên Mục Số
            </h4>
            <ul className="space-y-2 text-sm text-[#405866]">
              <li 
                onClick={() => scrollTo('section-audio')}
                className="hover:text-[#38A9E8] cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <span>📻 Phát thanh số</span>
              </li>
              <li 
                onClick={() => scrollTo('section-video')}
                className="hover:text-[#38A9E8] cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <span>📺 Đông Hội TV</span>
              </li>
              <li 
                onClick={() => scrollTo('section-competitions')}
                className="hover:text-[#38A9E8] cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <span>🏆 Các cuộc thi</span>
              </li>
              <li 
                onClick={() => scrollTo('section-gallery')}
                className="hover:text-[#38A9E8] cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <span>🖼️ Thư viện sản phẩm</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Management & Info */}
          <div>
            <h4 className="text-sm font-bold text-[#24506B] uppercase tracking-wider mb-3">
              Khu Vực Quản Trị
            </h4>
            <p className="text-xs text-[#405866] mb-3 leading-relaxed">
              Dành cho Ban chỉ huy Liên đội và Thầy cô Tổng phụ trách Đội quản lý sản phẩm học sinh.
            </p>
            <button
              onClick={onNavigateAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF8FF] border border-[#70C8F3] text-xs font-semibold text-[#24506B] hover:bg-[#38A9E8] hover:text-white transition-all shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Đăng nhập Quản trị</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#405866]/80 gap-2">
          <p>{settings.footerText || '© 2026 Liên đội Trường Tiểu học Đông Hội. All rights reserved.'}</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Được thực hiện với</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
            <span>cho học sinh Trường Tiểu học Đông Hội</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
