import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Tv, 
  Radio, 
  Image as ImageIcon, 
  Trophy, 
  FolderArchive, 
  Home as HomeIcon, 
  Palette, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  ArrowUp, 
  ArrowDown, 
  UploadCloud, 
  RefreshCw,
  Database,
  ShieldCheck,
  UserCheck,
  Newspaper,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  Product, 
  Competition, 
  MediaLibraryItem, 
  SiteSettings, 
  HomepageConfig, 
  HomepageSection 
} from '../../types';
import { ProductFormModal } from './ProductFormModal';
import { CompetitionFormModal } from './CompetitionFormModal';
import { MediaPickerModal } from './MediaPickerModal';
import { processImageFile, uploadImageFile } from '../../utils/imageUtils';

interface AdminDashboardProps {
  settings: SiteSettings;
  homepageConfig: HomepageConfig;
  products: Product[];
  competitions: Competition[];
  mediaList: MediaLibraryItem[];
  onSaveProduct: (product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onSaveCompetition: (comp: Partial<Competition>) => Promise<void>;
  onDeleteCompetition: (id: string) => Promise<void>;
  onSaveSiteSettings: (settings: SiteSettings) => Promise<void>;
  onSaveHomepageConfig: (config: HomepageConfig) => Promise<void>;
  onAddMediaItem: (item: Omit<MediaLibraryItem, 'id'>) => Promise<void>;
  onDeleteMediaItem: (id: string) => Promise<void>;
  onSeedData: () => Promise<void>;
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  homepageConfig,
  products,
  competitions,
  mediaList,
  onSaveProduct,
  onDeleteProduct,
  onSaveCompetition,
  onDeleteCompetition,
  onSaveSiteSettings,
  onSaveHomepageConfig,
  onAddMediaItem,
  onDeleteMediaItem,
  onSeedData,
  onNavigateHome,
}) => {
  const { user, adminDisplayName, logout } = useAuth();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'news' | 'video' | 'audio' | 'gallery' | 'competitions' | 'media' | 'homepage' | 'interface' | 'settings'
  >('overview');

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [showCompetitionModal, setShowCompetitionModal] = useState(false);
  
  // Delete confirm dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'product' | 'competition' | 'media';
    id: string;
    title: string;
  } | null>(null);

  // Interface local form state
  const [interfaceForm, setInterfaceForm] = useState<SiteSettings>({ ...settings });
  const [savingInterface, setSavingInterface] = useState(false);
  const [showMediaPickerForInterface, setShowMediaPickerForInterface] = useState<'logo' | 'cover' | null>(null);

  // Sync interfaceForm whenever parent settings prop changes
  useEffect(() => {
    setInterfaceForm({ ...settings });
  }, [settings]);

  // Dedicated state for Logo update
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingLogoPreview, setPendingLogoPreview] = useState<string | null>(null);
  const [savingLogo, setSavingLogo] = useState(false);

  // Dedicated state for Cover Banner update
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [pendingCoverPreview, setPendingCoverPreview] = useState<string | null>(null);
  const [savingCover, setSavingCover] = useState(false);

  // File input refs for uploading logo and cover from device
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // File selection for LOGO TRƯỜNG
  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Kích thước ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn.', 'error');
      return;
    }

    setPendingLogoFile(file);
    try {
      const preview = await processImageFile(file, 800, 0.9);
      setPendingLogoPreview(preview);
      showToast('Đã chọn logo mới. Bấm "LƯU THAY ĐỔI" để áp dụng lên toàn bộ website.');
    } catch (err) {
      console.error('Error previewing logo:', err);
    }
    e.target.value = '';
  };

  // Save LOGO TRƯỜNG
  const handleSaveLogo = async () => {
    if (!pendingLogoFile && !pendingLogoPreview) return;
    setSavingLogo(true);
    try {
      let finalUrl = pendingLogoPreview!;
      if (pendingLogoFile) {
        finalUrl = await uploadImageFile(pendingLogoFile, 'logos');
      }
      const updatedSettings = {
        ...settings,
        ...interfaceForm,
        logoUrl: finalUrl,
        updatedAt: new Date().toISOString()
      };
      await onSaveSiteSettings(updatedSettings);
      setInterfaceForm(updatedSettings);
      setPendingLogoFile(null);
      setPendingLogoPreview(null);
      showToast('✓ Đã cập nhật Logo trường thành công! Header và Footer website đã hiển thị logo mới.');

      // Also register to media library
      try {
        await onAddMediaItem({
          name: `Logo trường - ${pendingLogoFile?.name || 'Mới'}`,
          type: 'image',
          url: finalUrl,
          size: `${((pendingLogoFile?.size || 50000) / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toISOString().split('T')[0],
        });
      } catch (_) {}
    } catch (err) {
      showToast('Lỗi khi lưu Logo mới', 'error');
    } finally {
      setSavingLogo(false);
    }
  };

  // Cancel LOGO TRƯỜNG preview
  const handleCancelLogo = () => {
    setPendingLogoFile(null);
    setPendingLogoPreview(null);
    showToast('Đã hủy thay đổi logo.');
  };

  // File selection for ẢNH BÌA WEBSITE
  const handleCoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('Kích thước ảnh vượt quá 15MB. Vui lòng chọn ảnh nhỏ hơn.', 'error');
      return;
    }

    setPendingCoverFile(file);
    try {
      const preview = await processImageFile(file, 1920, 0.85);
      setPendingCoverPreview(preview);
      showToast('Đã chọn ảnh bìa mới. Bấm "LƯU THAY ĐỔI" để làm mới Hero Banner.');
    } catch (err) {
      console.error('Error previewing cover:', err);
    }
    e.target.value = '';
  };

  // Save ẢNH BÌA WEBSITE
  const handleSaveCover = async () => {
    if (!pendingCoverFile && !pendingCoverPreview) return;
    setSavingCover(true);
    try {
      let finalUrl = pendingCoverPreview!;
      if (pendingCoverFile) {
        finalUrl = await uploadImageFile(pendingCoverFile, 'banners');
      }
      const updatedSettings = {
        ...settings,
        ...interfaceForm,
        coverUrl: finalUrl,
        updatedAt: new Date().toISOString()
      };
      await onSaveSiteSettings(updatedSettings);
      setInterfaceForm(updatedSettings);
      setPendingCoverFile(null);
      setPendingCoverPreview(null);
      showToast('✓ Đã cập nhật Ảnh bìa website thành công! Hero Banner trên trang chủ đã được làm mới.');

      // Also register to media library
      try {
        await onAddMediaItem({
          name: `Ảnh bìa website - ${pendingCoverFile?.name || 'Mới'}`,
          type: 'cover',
          url: finalUrl,
          size: `${((pendingCoverFile?.size || 100000) / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toISOString().split('T')[0],
        });
      } catch (_) {}
    } catch (err) {
      showToast('Lỗi khi lưu Ảnh bìa mới', 'error');
    } finally {
      setSavingCover(false);
    }
  };

  // Cancel ẢNH BÌA WEBSITE preview
  const handleCancelCover = () => {
    setPendingCoverFile(null);
    setPendingCoverPreview(null);
    showToast('Đã hủy thay đổi ảnh bìa.');
  };

  // Homepage sections state
  const [sectionsState, setSectionsState] = useState<HomepageSection[]>([...homepageConfig.sections]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Quick product publish toggle
  const handleTogglePublish = async (prod: Product) => {
    try {
      await onSaveProduct({
        ...prod,
        isPublished: !prod.isPublished
      });
      showToast(`Đã ${!prod.isPublished ? 'xuất bản' : 'chuyển thành bản nháp'}: ${prod.title}`);
    } catch (err) {
      showToast('Có lỗi xảy ra khi cập nhật', 'error');
    }
  };

  // Quick product featured toggle
  const handleToggleFeatured = async (prod: Product) => {
    try {
      await onSaveProduct({
        ...prod,
        isFeatured: !prod.isFeatured
      });
      showToast(`Đã cập nhật trạng thái nổi bật: ${prod.title}`);
    } catch (err) {
      showToast('Có lỗi xảy ra khi cập nhật', 'error');
    }
  };

  // Confirm delete handler
  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'product') {
        await onDeleteProduct(deleteConfirm.id);
        showToast(`Đã xóa sản phẩm: ${deleteConfirm.title}`);
      } else if (deleteConfirm.type === 'competition') {
        await onDeleteCompetition(deleteConfirm.id);
        showToast(`Đã xóa cuộc thi: ${deleteConfirm.title}`);
      } else if (deleteConfirm.type === 'media') {
        await onDeleteMediaItem(deleteConfirm.id);
        showToast(`Đã xóa tệp media: ${deleteConfirm.title}`);
      }
    } catch (err) {
      showToast('Thao tác xóa thất bại', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Save interface settings
  const handleSaveInterface = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInterface(true);
    try {
      await onSaveSiteSettings(interfaceForm);
      showToast('Đã lưu cấu hình giao diện thành công!');
    } catch (err) {
      showToast('Lỗi khi lưu giao diện', 'error');
    } finally {
      setSavingInterface(false);
    }
  };

  // Section reordering
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const newSections = [...sectionsState];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    newSections.forEach((s, idx) => s.order = idx + 1);
    setSectionsState(newSections);
    try {
      await onSaveHomepageConfig({
        ...homepageConfig,
        sections: newSections
      });
      showToast('Đã cập nhật thứ tự các mục trên Trang chủ');
    } catch (err) {
      showToast('Lỗi cập nhật cấu hình Trang chủ', 'error');
    }
  };

  // Section visibility toggle
  const handleToggleSection = async (sectionId: string) => {
    const newSections = sectionsState.map(s => 
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    );
    setSectionsState(newSections);
    try {
      await onSaveHomepageConfig({
        ...homepageConfig,
        sections: newSections
      });
      showToast('Đã lưu trạng thái hiển thị mục');
    } catch (err) {
      showToast('Lỗi cập nhật trạng thái', 'error');
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'news') return p.type === 'news' && matchesSearch;
    if (activeTab === 'video') return p.type === 'video' && matchesSearch;
    if (activeTab === 'audio') return p.type === 'audio' && matchesSearch;
    if (activeTab === 'gallery') return (p.type === 'image' || p.type === 'gallery' || p.type === 'digital') && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F6FCFF] flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-70 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in ${
          toastMessage.type === 'success' ? 'bg-[#24506B] text-white border border-[#70C8F3]' : 'bg-red-600 text-white'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-[#FFD76A]" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="bg-white border-b border-[#EAF8FF] px-6 py-3 sticky top-0 z-30 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF8FF] p-1 border border-[#70C8F3] flex items-center justify-center">
            <img src={settings.logoUrl || './assets/logo_dong_hoi.svg'} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-[#24506B]">BẢNG ĐIỀU KHIỂN QUẢN TRỊ</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#38A9E8] text-white">
                CMS ĐÔNG HỘI
              </span>
            </div>
            <p className="text-xs text-[#405866]">
              Tài khoản: <strong className="text-[#38A9E8]">{adminDisplayName}</strong> ({user?.email || 'donghoic1@gmail.com'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-[#24506B] hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#38A9E8]" />
            <span>Xem website</span>
          </button>

          <button
            onClick={async () => {
              await logout();
              onNavigateHome();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Admin Content Area with Sidebar Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-[#EAF8FF] p-4 shrink-0">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
              DANH MỤC QUẢN TRỊ
            </p>
            {[
              { id: 'overview', label: 'TỔNG QUAN', icon: LayoutDashboard },
              { id: 'news', label: 'BẢN TIN NHANH', icon: Newspaper },
              { id: 'video', label: 'VIDEO (Đông Hội TV)', icon: Tv },
              { id: 'audio', label: 'PHÁT THANH AUDIO', icon: Radio },
              { id: 'gallery', label: 'HÌNH ẢNH & SẢN PHẨM', icon: ImageIcon },
              { id: 'competitions', label: 'CÁC CUỘC THI', icon: Trophy },
              { id: 'media', label: 'THƯ VIỆN MEDIA', icon: FolderArchive },
              { id: 'homepage', label: 'TRANG CHỦ', icon: HomeIcon },
              { id: 'interface', label: 'GIAO DIỆN WEBSITE', icon: Palette },
              { id: 'settings', label: 'CÀI ĐẶT', icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-[#38A9E8] text-white shadow-xs'
                      : 'text-[#24506B] hover:bg-[#EAF8FF] hover:text-[#38A9E8]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Add Product CTA in sidebar */}
          <div className="pt-6 mt-6 border-t border-gray-100">
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowProductModal(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#24506B] hover:bg-[#38A9E8] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>ĐĂNG SẢN PHẨM MỚI</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* TAB 1: TỔNG QUAN */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-[#EAF8FF] shadow-xs">
                  <span className="text-[11px] font-bold text-[#405866]">Tổng sản phẩm</span>
                  <p className="text-2xl font-black text-[#24506B] mt-1">{products.length}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#EAF8FF] shadow-xs">
                  <span className="text-[11px] font-bold text-red-500">Video Đông Hội TV</span>
                  <p className="text-2xl font-black text-[#24506B] mt-1">
                    {products.filter(p => p.type === 'video').length}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#EAF8FF] shadow-xs">
                  <span className="text-[11px] font-bold text-[#38A9E8]">Phát thanh số (Audio)</span>
                  <p className="text-2xl font-black text-[#24506B] mt-1">
                    {products.filter(p => p.type === 'audio').length}
                  </p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#EAF8FF] shadow-xs">
                  <span className="text-[11px] font-bold text-[#FFD76A]">Cuộc thi Liên đội</span>
                  <p className="text-2xl font-black text-[#24506B] mt-1">{competitions.length}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#EAF8FF] shadow-xs">
                  <span className="text-[11px] font-bold text-purple-500">Tệp trong Thư viện</span>
                  <p className="text-2xl font-black text-[#24506B] mt-1">{mediaList.length}</p>
                </div>
              </div>

              {/* Recent Products Management Table */}
              <div className="bg-white rounded-3xl p-6 border border-[#EAF8FF] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#24506B]">Tất cả sản phẩm học sinh</h3>
                    <p className="text-xs text-[#405866]">Quản lý trạng thái xuất bản, nổi bật, sửa và xóa nội dung</p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Tìm bài đăng / học sinh..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setShowProductModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#38A9E8] text-white text-xs font-bold hover:bg-[#24506B] transition-colors shrink-0"
                    >
                      + Thêm mới
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-3">Tác phẩm & Thumbnail</th>
                        <th className="py-3 px-3">Loại</th>
                        <th className="py-3 px-3">Học sinh / Lớp</th>
                        <th className="py-3 px-3">Trạng thái</th>
                        <th className="py-3 px-3">Nổi bật</th>
                        <th className="py-3 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-[#F6FCFF] transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="max-w-xs">
                                <p className="font-bold text-[#24506B] truncate">{p.title}</p>
                                <span className="text-[10px] text-gray-400">{p.createdAt || 'Mới đăng'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EAF8FF] text-[#38A9E8] uppercase">
                              {p.type}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-semibold text-[#24506B]">{p.studentName}</p>
                            <span className="text-[10px] text-gray-400">Lớp {p.studentClass}</span>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleTogglePublish(p)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                p.isPublished
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              }`}
                            >
                              {p.isPublished ? '✓ Đã xuất bản' : '○ Bản nháp'}
                            </button>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleToggleFeatured(p)}
                              className={`p-1.5 rounded-lg transition-all ${
                                p.isFeatured
                                  ? 'text-[#FFD76A] hover:bg-yellow-50'
                                  : 'text-gray-300 hover:text-gray-400'
                              }`}
                              title={p.isFeatured ? 'Đang nổi bật' : 'Bấm để đặt nổi bật'}
                            >
                              <Star className={`w-4 h-4 ${p.isFeatured ? 'fill-current' : ''}`} />
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setShowProductModal(true);
                                }}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({
                                  type: 'product',
                                  id: p.id,
                                  title: p.title
                                })}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2, 3, 4: NEWS / VIDEO / AUDIO / GALLERY SPECIFIC VIEW */}
          {(activeTab === 'news' || activeTab === 'video' || activeTab === 'audio' || activeTab === 'gallery') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-[#EAF8FF]">
                <div>
                  <h2 className="text-lg font-bold text-[#24506B] uppercase">
                    Quản lý {activeTab === 'news' ? 'Bản tin nhanh (Bài viết + Nhiều ảnh)' : activeTab === 'video' ? 'Video Đông Hội TV' : activeTab === 'audio' ? 'Phát thanh Măng non số (Audio)' : 'Hình ảnh & Sản phẩm học sinh'}
                  </h2>
                  <p className="text-xs text-[#405866]">
                    Danh sách các tác phẩm định dạng {activeTab === 'news' ? 'phóng sự ảnh' : activeTab === 'video' ? '16:9' : activeTab === 'audio' ? '1:1' : 'gallery'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#38A9E8] hover:bg-[#24506B] text-white text-xs font-bold shadow-xs transition-all"
                >
                  + Đăng tác phẩm mới
                </button>
              </div>

              {/* Grid display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="bg-white rounded-3xl overflow-hidden border border-[#EAF8FF] shadow-xs flex flex-col">
                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                      <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-1 rounded-full ${p.isFeatured ? 'bg-[#FFD76A] text-[#24506B]' : 'bg-black/40 text-white'}`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#24506B] line-clamp-1">{p.title}</h4>
                        <p className="text-xs text-[#405866] line-clamp-2 mt-1">{p.description}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#24506B]">{p.studentName} ({p.studentClass})</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setShowProductModal(true);
                            }}
                            className="p-1 rounded text-blue-600 hover:bg-blue-50"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'product', id: p.id, title: p.title })}
                            className="p-1 rounded text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CÁC CUỘC THI */}
          {activeTab === 'competitions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-[#EAF8FF]">
                <div>
                  <h2 className="text-lg font-bold text-[#24506B]">Quản lý Các Cuộc thi của Liên đội</h2>
                  <p className="text-xs text-[#405866]">
                    Admin có thể tạo thêm cuộc thi mới mà không cần sửa mã nguồn
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingCompetition(null);
                    setShowCompetitionModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#38A9E8] hover:bg-[#24506B] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>TẠO CUỘC THI MỚI</span>
                </button>
              </div>

              {/* Competitions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {competitions.map((comp) => {
                  const count = products.filter(
                    p => p.competitionId === comp.id || p.competitionId === comp.slug
                  ).length;

                  return (
                    <div key={comp.id} className="bg-white rounded-3xl overflow-hidden border border-[#EAF8FF] shadow-xs flex flex-col">
                      <div className="relative h-36 w-full bg-slate-800">
                        <img src={comp.banner} alt={comp.title} className="w-full h-full object-cover opacity-80" />
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD76A] text-[#24506B]">
                          {comp.status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'}
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="text-base font-bold text-[#24506B]">{comp.title}</h4>
                          <p className="text-xs text-[#405866] line-clamp-2 mt-1">{comp.description}</p>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="font-bold text-[#38A9E8]">{count} sản phẩm dự thi</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingCompetition(comp);
                                setShowCompetitionModal(true);
                              }}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                              title="Sửa"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ type: 'competition', id: comp.id, title: comp.title })}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: THƯ VIỆN MEDIA DÙNG CHUNG */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-[#EAF8FF] space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#24506B]">Thư viện Media Dùng Chung</h2>
                    <p className="text-xs text-[#405866]">
                      Lưu trữ tập trung: Hình ảnh, Audio, Video, Banner Cover, Thumbnail cho toàn website
                    </p>
                  </div>
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
                  {mediaList.map((m) => (
                    <div key={m.id} className="bg-[#F6FCFF] rounded-2xl overflow-hidden border border-[#EAF8FF] p-2 flex flex-col justify-between">
                      <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden relative group">
                        {m.type === 'audio' ? (
                          <div className="w-full h-full bg-[#EAF8FF] flex items-center justify-center">
                            <Radio className="w-8 h-8 text-[#38A9E8]" />
                          </div>
                        ) : (
                          <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                        )}
                        <button
                          onClick={() => setDeleteConfirm({ type: 'media', id: m.id, title: m.name })}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xóa khỏi thư viện"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs font-bold text-[#24506B] truncate" title={m.name}>{m.name}</p>
                        <span className="text-[10px] text-gray-400 capitalize">{m.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: QUẢN LÝ TRANG CHỦ */}
          {activeTab === 'homepage' && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-white p-6 rounded-3xl border border-[#EAF8FF] space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-[#24506B]">Quản lý Cấu trúc Trang chủ</h2>
                  <p className="text-xs text-[#405866]">
                    Bật / Tắt và thay đổi thứ tự các section xuất hiện trên Trang chủ
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {sectionsState.map((sec, idx) => (
                    <div
                      key={sec.id}
                      className="p-4 rounded-2xl bg-[#F6FCFF] border border-[#EAF8FF] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-white border border-[#70C8F3] text-xs font-bold text-[#24506B] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-[#24506B]">{sec.title}</h4>
                          <span className="text-[11px] text-gray-400">ID: {sec.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Move Up / Down */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, 'up')}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                          title="Di chuyển lên"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sectionsState.length - 1}
                          onClick={() => handleMoveSection(idx, 'down')}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                          title="Di chuyển xuống"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        {/* Visibility Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleSection(sec.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            sec.enabled
                              ? 'bg-[#38A9E8] text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {sec.enabled ? 'Đang bật' : 'Đã ẩn'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: QUẢN LÝ GIAO DIỆN WEBSITE */}
          {activeTab === 'interface' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-black text-[#24506B]">GIAO DIỆN WEBSITE</h2>
                <p className="text-xs text-[#405866]">
                  Quản lý Logo trường, Ảnh bìa Hero Banner và các nhận diện thương hiệu công khai của website.
                </p>
              </div>

              {/* MỤC 1: LOGO TRƯỜNG (CRITICAL REQUIREMENT 2) */}
              <div className="bg-white p-6 rounded-3xl border-2 border-[#70C8F3]/50 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAF8FF] pb-3">
                  <div>
                    <h3 className="text-base font-black text-[#24506B] flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-[#38A9E8]" />
                      <span>LOGO TRƯỜNG</span>
                    </h3>
                    <p className="text-xs text-[#405866] mt-0.5">
                      Hiển thị tại thanh điều hướng trên cùng (Header) và góc chân trang (Footer). Giữ nguyên tỉ lệ gốc, không méo hình.
                    </p>
                  </div>

                  {/* Hidden file input for logo */}
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    onChange={handleLogoFileSelect}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />

                  {/* Nút TẢI LOGO MỚI */}
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38A9E8] hover:bg-[#24506B] text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>TẢI LOGO MỚI</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                  {/* Cột 1: Logo hiện tại */}
                  <div className="space-y-2 p-4 rounded-2xl bg-[#F6FCFF] border border-[#EAF8FF]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#24506B]">Logo hiện tại</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                        Đang áp dụng
                      </span>
                    </div>
                    <div className="w-28 h-28 mx-auto rounded-2xl bg-white p-2.5 border-2 border-gray-200 shadow-xs flex items-center justify-center overflow-hidden">
                      <img
                        src={settings.logoUrl || './assets/logo_dong_hoi.svg'}
                        alt="Logo hiện tại"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = './assets/logo_dong_hoi.svg';
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 text-center truncate">
                      {settings.logoUrl || './assets/logo_dong_hoi.svg'}
                    </p>
                  </div>

                  {/* Cột 2: Preview Logo mới (khi đã chọn file) */}
                  <div className={`space-y-3 p-4 rounded-2xl border transition-all ${
                    pendingLogoPreview ? 'bg-[#EAF8FF]/60 border-[#38A9E8]' : 'bg-gray-50/60 border-dashed border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#24506B]">Xem trước Logo mới</span>
                      {pendingLogoPreview ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                          Chờ lưu thay đổi
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Chưa chọn ảnh mới</span>
                      )}
                    </div>

                    {pendingLogoPreview ? (
                      <div className="space-y-3">
                        <div className="w-28 h-28 mx-auto rounded-2xl bg-white p-2.5 border-2 border-[#38A9E8] shadow-md flex items-center justify-center overflow-hidden ring-4 ring-[#38A9E8]/20">
                          <img
                            src={pendingLogoPreview}
                            alt="Logo mới được chọn"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-[11px] text-[#24506B] font-medium text-center truncate">
                          {pendingLogoFile?.name || 'Ảnh logo mới tải từ thiết bị'}
                        </p>

                        {/* Các nút HỦY và LƯU THAY ĐỔI */}
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleCancelLogo}
                            disabled={savingLogo}
                            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-bold transition-all disabled:opacity-50"
                          >
                            HỦY
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveLogo}
                            disabled={savingLogo}
                            className="px-5 py-2 rounded-xl bg-[#38A9E8] hover:bg-[#24506B] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {savingLogo ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Đang lưu...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>LƯU THAY ĐỔI</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => logoFileInputRef.current?.click()}
                        className="h-28 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:bg-white transition-all space-y-1"
                      >
                        <UploadCloud className="w-7 h-7 text-[#70C8F3]" />
                        <span className="text-xs font-bold text-[#24506B]">Bấm "TẢI LOGO MỚI"</span>
                        <span className="text-[10px] text-gray-400">Chọn file ảnh PNG, JPG hoặc WebP</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MỤC 2: ẢNH BÌA WEBSITE (CRITICAL REQUIREMENT 3) */}
              <div className="bg-white p-6 rounded-3xl border-2 border-[#70C8F3]/50 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAF8FF] pb-3">
                  <div>
                    <h3 className="text-base font-black text-[#24506B] flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-[#38A9E8]" />
                      <span>ẢNH BÌA WEBSITE</span>
                    </h3>
                    <p className="text-xs text-[#405866] mt-0.5">
                      Hiển thị tại khung tạp chí trên cùng của Trang chủ (Hero Banner). Khuyến nghị tỉ lệ 16:9 hoặc 21:9 ngang.
                    </p>
                  </div>

                  {/* Hidden file input for cover */}
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    onChange={handleCoverFileSelect}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />

                  {/* Nút TẢI ẢNH BÌA MỚI */}
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38A9E8] hover:bg-[#24506B] text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>TẢI ẢNH BÌA MỚI</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Ảnh bìa hiện tại */}
                  <div className="p-4 rounded-2xl bg-[#F6FCFF] border border-[#EAF8FF] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#24506B]">Ảnh bìa hiện tại trên website</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                        Đang hiển thị trên Hero Banner
                      </span>
                    </div>
                    <div className="relative aspect-16/9 sm:aspect-21/9 max-h-[260px] w-full rounded-2xl overflow-hidden bg-slate-900 border border-[#70C8F3]/60 shadow-xs">
                      <img
                        src={settings.coverUrl || './assets/banner_hero_main.svg'}
                        alt="Ảnh bìa website hiện tại"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = './assets/banner_hero_main.svg';
                        }}
                      />
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px] font-bold backdrop-blur-xs">
                        {settings.schoolName || 'TRƯỜNG TIỂU HỌC ĐÔNG HỘI'}
                      </div>
                    </div>
                  </div>

                  {/* Preview Ảnh bìa mới (nếu có file được chọn) */}
                  {pendingCoverPreview && (
                    <div className="p-5 rounded-2xl bg-[#EAF8FF]/70 border-2 border-[#38A9E8] shadow-sm space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#24506B] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#38A9E8]" />
                          <span>XEM TRƯỚC ẢNH BÌA MỚI SẼ HIỂN THỊ</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                          Chờ xác nhận lưu
                        </span>
                      </div>

                      <div className="relative aspect-16/9 sm:aspect-21/9 max-h-[300px] w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-[#38A9E8] shadow-md ring-4 ring-[#38A9E8]/20">
                        <img
                          src={pendingCoverPreview}
                          alt="Xem trước ảnh bìa mới"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-3 text-white text-xs font-bold drop-shadow-md">
                          Xem trước ảnh bìa mới sau khi lưu
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <p className="text-xs text-[#24506B] font-medium">
                          Tệp: <strong>{pendingCoverFile?.name || 'Ảnh bìa mới'}</strong>
                        </p>

                        {/* Nút HỦY và LƯU THAY ĐỔI */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCancelCover}
                            disabled={savingCover}
                            className="px-5 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold transition-all disabled:opacity-50"
                          >
                            HỦY
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveCover}
                            disabled={savingCover}
                            className="px-6 py-2 rounded-xl bg-[#38A9E8] hover:bg-[#24506B] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {savingCover ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Đang upload & lưu...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>LƯU THAY ĐỔI</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* MỤC 3: THÔNG TIN CHUNG & KÊNH TRUYỀN THÔNG */}
              <form onSubmit={handleSaveInterface} className="bg-white p-6 rounded-3xl border border-[#EAF8FF] space-y-5">
                <div className="border-b border-[#EAF8FF] pb-3">
                  <h3 className="text-base font-black text-[#24506B]">THÔNG TIN CHUNG & KÊNH TRUYỀN THÔNG</h3>
                  <p className="text-xs text-[#405866]">
                    Tên website, tên trường học, khẩu hiệu và các liên kết mạng xã hội chính thức
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#24506B] mb-1">Tên website</label>
                      <input
                        type="text"
                        value={interfaceForm.siteName}
                        onChange={(e) => setInterfaceForm({ ...interfaceForm, siteName: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#24506B] mb-1">Tên Trường học</label>
                      <input
                        type="text"
                        value={interfaceForm.schoolName}
                        onChange={(e) => setInterfaceForm({ ...interfaceForm, schoolName: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#24506B] mb-1">Tagline Khẩu hiệu</label>
                    <input
                      type="text"
                      value={interfaceForm.tagline}
                      onChange={(e) => setInterfaceForm({ ...interfaceForm, tagline: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#24506B] mb-1">Link Facebook trường</label>
                      <input
                        type="url"
                        value={interfaceForm.facebookUrl}
                        onChange={(e) => setInterfaceForm({ ...interfaceForm, facebookUrl: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#24506B] mb-1">Link Kênh YouTube Đông Hội TV</label>
                      <input
                        type="url"
                        value={interfaceForm.youtubeUrl}
                        onChange={(e) => setInterfaceForm({ ...interfaceForm, youtubeUrl: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#24506B] mb-1">Nội dung Chân trang (Footer)</label>
                    <textarea
                      rows={2}
                      value={interfaceForm.footerText}
                      onChange={(e) => setInterfaceForm({ ...interfaceForm, footerText: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingInterface}
                    className="px-6 py-2.5 rounded-xl bg-[#24506B] hover:bg-[#38A9E8] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {savingInterface ? 'Đang lưu...' : 'Lưu Thay Đổi Thông Tin'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 9: CÀI ĐẶT & HỆ THỐNG */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-white p-6 rounded-3xl border border-[#EAF8FF] space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-[#24506B]">Hệ Thống Cơ Sở Dữ Liệu & Bảo Mật</h2>
                  <p className="text-xs text-[#405866]">
                    Trạng thái kết nối Google Firebase Firestore & Xác thực Quản trị
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#F6FCFF] border border-[#EAF8FF] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#24506B]">Cloud Firestore Database</h4>
                        <p className="text-xs text-gray-500">Cơ sở dữ liệu đám mây thời gian thực, lưu trữ vĩnh viễn</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      Đang hoạt động
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F6FCFF] border border-[#EAF8FF] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#24506B]">Quy tắc Bảo mật (Security Rules)</h4>
                        <p className="text-xs text-gray-500">Phân quyền ABAC: Khách chỉ READ published, Admin toàn quyền</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      Đã triển khai
                    </span>
                  </div>

                  {/* Seed initial data button */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Đồng bộ Dữ liệu Mẫu (Seed Data)</h4>
                      <p className="text-xs text-amber-700">
                        Nạp toàn bộ dữ liệu mẫu ban đầu từ contentData.json vào cơ sở dữ liệu Firestore
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await onSeedData();
                          showToast('Đồng bộ dữ liệu mẫu vào Firestore thành công!');
                        } catch (e) {
                          showToast('Lỗi khi đồng bộ dữ liệu', 'error');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
                    >
                      Đồng bộ vào Firestore
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#24506B]">Xác nhận xóa nội dung</h3>
              <p className="text-xs text-[#405866] mt-1">
                Bạn có chắc chắn muốn xóa "<strong>{deleteConfirm.title}</strong>"? Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#405866]"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleExecuteDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductModal && (
        <ProductFormModal
          product={editingProduct}
          competitions={competitions}
          mediaList={mediaList}
          onSave={onSaveProduct}
          onClose={() => setShowProductModal(false)}
          onAddNewMedia={onAddMediaItem}
        />
      )}

      {/* Competition Form Modal */}
      {showCompetitionModal && (
        <CompetitionFormModal
          competition={editingCompetition}
          mediaList={mediaList}
          onSave={onSaveCompetition}
          onClose={() => setShowCompetitionModal(false)}
          onAddNewMedia={onAddMediaItem}
        />
      )}

      {/* Shared Media Picker Modal for Interface (Logo / Cover) */}
      {showMediaPickerForInterface && (
        <MediaPickerModal
          mediaList={mediaList}
          filterType="cover"
          onSelect={(url) => {
            if (showMediaPickerForInterface === 'logo') {
              setInterfaceForm(prev => ({ ...prev, logoUrl: url }));
              showToast('Đã chọn Logo từ Thư viện Media!');
            } else {
              setInterfaceForm(prev => ({ ...prev, coverUrl: url }));
              showToast('Đã chọn Ảnh bìa từ Thư viện Media!');
            }
            setShowMediaPickerForInterface(null);
          }}
          onClose={() => setShowMediaPickerForInterface(null)}
          onAddNewMedia={onAddMediaItem}
        />
      )}
    </div>
  );
};
