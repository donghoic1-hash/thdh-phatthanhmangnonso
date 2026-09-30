import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { dataService } from './services/dataService';
import { 
  SiteSettings, 
  HomepageConfig, 
  Product, 
  Competition, 
  MediaLibraryItem 
} from './types';
import initialContent from './data/contentData.json';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { MediaModal } from './components/MediaModal';
import { CompetitionModal } from './components/CompetitionModal';

import { BannerHero } from './components/sections/BannerHero';
import { FeaturedSection } from './components/sections/FeaturedSection';
import { NewsSection } from './components/sections/NewsSection';
import { AudioSection } from './components/sections/AudioSection';
import { VideoSection } from './components/sections/VideoSection';
import { CompetitionsSection } from './components/sections/CompetitionsSection';
import { GallerySection } from './components/sections/GallerySection';

import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';

function MainApp() {
  const { user, isAuthenticated, isAdmin, loading: authLoading, logout } = useAuth();

  // State with persistent local storage sync to prevent any flash or loss on refresh
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem('donghoi_site_settings');
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return initialContent.siteSettings as SiteSettings;
  });

  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(() => {
    try {
      const cached = localStorage.getItem('donghoi_homepage_config');
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return initialContent.homepageConfig as HomepageConfig;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('donghoi_products');
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return initialContent.products as Product[];
  });

  const [competitions, setCompetitions] = useState<Competition[]>(() => {
    try {
      const cached = localStorage.getItem('donghoi_competitions');
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return initialContent.competitions as Competition[];
  });

  const [mediaList, setMediaList] = useState<MediaLibraryItem[]>(() => {
    try {
      const cached = localStorage.getItem('donghoi_media');
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return initialContent.mediaLibrary as MediaLibraryItem[];
  });
  const [loading, setLoading] = useState(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentAudioTrack, setCurrentAudioTrack] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

  // Sync URL routing on load and browser back/forward buttons
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setActiveTab('admin');
      } else if (path === '/admin/login') {
        setActiveTab('admin-login');
      } else {
        setActiveTab('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Fetch initial data from Firestore / fallback
  useEffect(() => {
    async function loadData() {
      try {
        const [settingsData, configData, prodsData, compsData, mediaData] = await Promise.all([
          dataService.getSiteSettings(),
          dataService.getHomepageConfig(),
          dataService.getProducts(true),
          dataService.getCompetitions(true),
          dataService.getMediaLibrary(),
        ]);

        if (settingsData) setSiteSettings(settingsData);
        if (configData) setHomepageConfig(configData);
        if (prodsData && prodsData.length > 0) setProducts(prodsData);
        if (compsData && compsData.length > 0) setCompetitions(compsData);
        if (mediaData && mediaData.length > 0) setMediaList(mediaData);
      } catch (err) {
        console.warn('Error loading remote data, using local initial content:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Navigation router helper
  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (tab === 'admin-login') {
      window.history.pushState({}, '', '/admin/login');
    } else {
      window.history.pushState({}, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Admin Data mutations
  const handleSaveProduct = async (productData: Partial<Product>) => {
    const id = await dataService.saveProduct(productData);
    const updated = await dataService.getProducts(true);
    setProducts(updated);
  };

  const handleDeleteProduct = async (id: string) => {
    await dataService.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveCompetition = async (compData: Partial<Competition>) => {
    await dataService.saveCompetition(compData);
    const updated = await dataService.getCompetitions(true);
    setCompetitions(updated);
  };

  const handleDeleteCompetition = async (id: string) => {
    await dataService.deleteCompetition(id);
    setCompetitions(prev => prev.filter(c => c.id !== id));
  };

  const handleSaveSiteSettings = async (newSettings: SiteSettings) => {
    await dataService.saveSiteSettings(newSettings);
    setSiteSettings({ ...newSettings });
  };

  const handleSaveHomepageConfig = async (newConfig: HomepageConfig) => {
    await dataService.saveHomepageConfig(newConfig);
    setHomepageConfig(newConfig);
  };

  const handleAddMediaItem = async (item: Omit<MediaLibraryItem, 'id'>) => {
    await dataService.addMediaItem(item);
    const updated = await dataService.getMediaLibrary();
    setMediaList(updated);
  };

  const handleDeleteMediaItem = async (id: string) => {
    await dataService.deleteMediaItem(id);
    setMediaList(prev => prev.filter(m => m.id !== id));
  };

  const handleSeedData = async () => {
    await dataService.seedInitialData();
    const [settingsData, configData, prodsData, compsData, mediaData] = await Promise.all([
      dataService.getSiteSettings(),
      dataService.getHomepageConfig(),
      dataService.getProducts(true),
      dataService.getCompetitions(true),
      dataService.getMediaLibrary(),
    ]);
    if (settingsData) setSiteSettings(settingsData);
    if (configData) setHomepageConfig(configData);
    if (prodsData) setProducts(prodsData);
    if (compsData) setCompetitions(compsData);
    if (mediaData) setMediaList(mediaData);
  };

  // Find latest audio episode
  const latestAudio = products.find(p => p.type === 'audio' && p.isPublished);

  // PROTECTED ROUTE CHECK FOR /admin/*
  if (activeTab === 'admin' || activeTab === 'admin-login') {
    // Requirement 5 & 6: Display loading state while checking session
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#F6FCFF] flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#38A9E8]" />
            <p className="text-sm font-bold text-[#24506B]">Đang kiểm tra phiên đăng nhập...</p>
          </div>
        </div>
      );
    }

    // Accessing /admin
    if (activeTab === 'admin') {
      if (!isAuthenticated) {
        // Not authenticated -> redirect to /admin/login
        return (
          <AdminLogin
            settings={siteSettings}
            onNavigateHome={() => navigateTo('home')}
            onLoginSuccess={() => navigateTo('admin')}
          />
        );
      }

      if (!isAdmin) {
        // Authenticated but not Admin -> Access Denied
        return (
          <div className="min-h-screen bg-[#F6FCFF] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-red-200 text-center space-y-4 shadow-md">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[#24506B]">TRUY CẬP BỊ TỪ CHỐI</h2>
              <p className="text-xs text-[#405866]">
                Tài khoản của bạn không có quyền quản trị viên trên hệ thống này.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => navigateTo('home')}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#24506B]"
                >
                  Về trang chủ
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    navigateTo('admin-login');
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Authenticated and Admin -> Render Dashboard
      return (
        <AdminDashboard
          settings={siteSettings}
          homepageConfig={homepageConfig}
          products={products}
          competitions={competitions}
          mediaList={mediaList}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onSaveCompetition={handleSaveCompetition}
          onDeleteCompetition={handleDeleteCompetition}
          onSaveSiteSettings={handleSaveSiteSettings}
          onSaveHomepageConfig={handleSaveHomepageConfig}
          onAddMediaItem={handleAddMediaItem}
          onDeleteMediaItem={handleDeleteMediaItem}
          onSeedData={handleSeedData}
          onNavigateHome={() => navigateTo('home')}
          onNavigateLogin={() => navigateTo('admin-login')}
        />
      );
    }

    // Accessing /admin/login
    if (activeTab === 'admin-login') {
      if (isAuthenticated && isAdmin) {
        // Already logged in admin -> redirect to /admin
        navigateTo('admin');
        return null;
      }

      return (
        <AdminLogin
          settings={siteSettings}
          onNavigateHome={() => navigateTo('home')}
          onLoginSuccess={() => navigateTo('admin')}
        />
      );
    }
  }

  // Helper to render section by ID
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'banner':
        return (
          <BannerHero
            key="banner"
            settings={siteSettings}
            latestAudio={latestAudio}
            onPlayAudio={(track) => setCurrentAudioTrack(track)}
            onExploreClick={() => {
              const el = document.getElementById('section-featured');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        );
      case 'featured':
        return (
          <div key="featured" id="section-featured">
            <FeaturedSection
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onPlayAudio={(p) => setCurrentAudioTrack(p)}
            />
          </div>
        );
      case 'news':
        return (
          <div key="news" id="section-news">
            <NewsSection
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
            />
          </div>
        );
      case 'audio':
        return (
          <div key="audio" id="section-audio">
            <AudioSection
              products={products}
              currentTrackId={currentAudioTrack?.id}
              onPlayAudio={(p) => setCurrentAudioTrack(p)}
              onOpenDetails={(p) => setSelectedProduct(p)}
            />
          </div>
        );
      case 'video':
        return (
          <div key="video" id="section-video">
            <VideoSection
              products={products}
              onSelectVideo={(p) => setSelectedProduct(p)}
            />
          </div>
        );
      case 'competitions':
        return (
          <div key="competitions" id="section-competitions">
            <CompetitionsSection
              competitions={competitions}
              products={products}
              onSelectCompetition={(comp) => setSelectedCompetition(comp)}
            />
          </div>
        );
      case 'gallery':
        return (
          <div key="gallery" id="section-gallery">
            <GallerySection
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
            />
          </div>
        );
      case 'footer':
        return (
          <Footer
            key="footer"
            settings={siteSettings}
            onNavigateAdmin={() => navigateTo(user ? 'admin' : 'admin-login')}
            onNavigateSection={(id) => {
              const el = document.getElementById(id);
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        );
      default:
        return null;
    }
  };

  // Sort sections according to homepage config order
  const sortedSections = [...homepageConfig.sections]
    .sort((a, b) => a.order - b.order)
    .filter(s => s.enabled);

  return (
    <div className="min-h-screen bg-[#F6FCFF] flex flex-col font-sans selection:bg-[#38A9E8] selection:text-white">
      {/* Global Header */}
      <Header
        settings={siteSettings}
        activeTab={activeTab}
        onNavigate={(tab) => {
          if (tab === 'home') {
            navigateTo('home');
          } else if (tab === 'admin' || tab === 'admin-login') {
            navigateTo(tab);
          } else {
            // Scroll to designated section
            const sectionMap: Record<string, string> = {
              news: 'section-news',
              audio: 'section-audio',
              video: 'section-video',
              competitions: 'section-competitions',
              gallery: 'section-gallery',
            };
            const targetId = sectionMap[tab];
            if (targetId) {
              const el = document.getElementById(targetId);
              el?.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }}
        nowPlayingTitle={currentAudioTrack?.title}
        onOpenNowPlaying={() => currentAudioTrack && setSelectedProduct(currentAudioTrack)}
      />

      {/* Main Homepage Stream: Section by Section */}
      <main className="flex-1">
        {sortedSections.map(s => renderSection(s.id))}
      </main>

      {/* Persistent Audio Player Bar */}
      <AudioPlayerBar
        currentTrack={currentAudioTrack}
        onClose={() => setCurrentAudioTrack(null)}
      />

      {/* Universal Media Preview Modal (Video, Audio, Gallery) */}
      {selectedProduct && (
        <MediaModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onPlayAudio={(prod) => {
            setCurrentAudioTrack(prod);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Competition Details & Student Works Modal */}
      {selectedCompetition && (
        <CompetitionModal
          competition={selectedCompetition}
          products={products}
          onClose={() => setSelectedCompetition(null)}
          onSelectProduct={(prod) => {
            setSelectedCompetition(null);
            setSelectedProduct(prod);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
