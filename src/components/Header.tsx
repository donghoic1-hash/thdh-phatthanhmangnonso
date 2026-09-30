import React, { useState } from 'react';
import { 
  Radio, 
  Tv, 
  Trophy, 
  Image as ImageIcon, 
  Sparkles, 
  Lock, 
  Menu, 
  X, 
  Home,
  Music,
  ExternalLink,
  Newspaper
} from 'lucide-react';
import { SiteSettings } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  settings: SiteSettings;
  activeTab: string;
  onNavigate: (tab: string) => void;
  nowPlayingTitle?: string;
  onOpenNowPlaying?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  onNavigate,
  nowPlayingTitle,
  onOpenNowPlaying,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'news', label: 'Bản tin nhanh', icon: Newspaper },
    { id: 'audio', label: 'Phát thanh số', icon: Radio },
    { id: 'video', label: 'Đông Hội TV', icon: Tv },
    { id: 'competitions', label: 'Các cuộc thi', icon: Trophy },
    { id: 'gallery', label: 'Thư viện sản phẩm', icon: ImageIcon },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EAF8FF] shadow-xs">
      {/* Top Banner Notice for School Identity */}
      <div className="bg-[#EAF8FF] border-b border-[#70C8F3]/30 px-4 py-1 text-xs text-[#24506B] flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-[#38A9E8] animate-pulse"></span>
            <span>{settings.schoolName || 'TRƯỜNG TIỂU HỌC ĐÔNG HỘI'}</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="hidden sm:inline text-xs text-[#405866]">Huyện Đông Anh, Hà Nội</span>
          </div>

          <div className="flex items-center gap-3">
            {nowPlayingTitle && (
              <button 
                onClick={onOpenNowPlaying}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white text-[#38A9E8] border border-[#70C8F3] text-xs font-semibold hover:bg-[#38A9E8] hover:text-white transition-all shadow-xs"
              >
                <Music className="w-3.5 h-3.5 animate-spin" />
                <span className="max-w-[140px] truncate">Đang phát: {nowPlayingTitle}</span>
              </button>
            )}

            {isAuthenticated && isAdmin ? (
              <button
                onClick={() => onNavigate('admin')}
                className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#38A9E8] text-white hover:bg-[#24506B] transition-colors shadow-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>QUẢN TRỊ VIÊN</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('admin-login')}
                className="flex items-center gap-1 text-xs font-medium text-[#24506B] hover:text-[#38A9E8] transition-colors"
                title="Đăng nhập tài khoản quản trị viên"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Quản trị</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand identity: Logo & Name */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-12 h-12 rounded-xl bg-white p-1 border border-[#70C8F3]/50 shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
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
            <div className="flex items-center gap-2">
              <span className="text-lg md:text-xl font-extrabold tracking-tight text-[#24506B] group-hover:text-[#38A9E8] transition-colors">
                {settings.siteName || 'PHÁT THANH MĂNG NON SỐ'}
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD76A] text-[#24506B]">
                TẠP CHÍ SỐ
              </span>
            </div>
            <p className="text-xs text-[#405866] line-clamp-1 italic">
              {settings.tagline || 'Nơi những thanh âm trong trẻo của tuổi thơ cất cánh'}
            </p>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-[#38A9E8] text-white shadow-sm' 
                    : 'text-[#24506B] hover:text-[#38A9E8] hover:bg-[#EAF8FF]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#24506B] hover:bg-[#EAF8FF] focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EAF8FF] bg-white px-4 py-3 space-y-1 shadow-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#38A9E8] text-white'
                    : 'text-[#24506B] hover:bg-[#EAF8FF]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => handleNavClick(isAuthenticated && isAdmin ? 'admin' : 'admin-login')}
              className="flex items-center gap-2 text-xs font-semibold text-[#38A9E8] px-3 py-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isAuthenticated && isAdmin ? 'QUẢN TRỊ VIÊN' : 'Đăng nhập Quản trị'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
