import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Youtube, 
  Facebook, 
  User, 
  Calendar, 
  Heart, 
  Eye, 
  Share2, 
  Radio, 
  Tv, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';

interface MediaModalProps {
  product: Product | null;
  onClose: () => void;
  onPlayAudio?: (product: Product) => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({ product, onClose, onPlayAudio }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);

  // Extract YouTube ID if valid
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1`
      : null;
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(product?.youtubeUrl || product?.videoUrl);
  
  // Construct images array: prioritize images[] array if available, fallback to thumbnail
  const allImages: string[] = React.useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return product.thumbnail ? [product.thumbnail] : [];
  }, [product]);

  // Keyboard navigation for Lightbox and Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxImageIndex !== null) {
        if (e.key === 'Escape') {
          setLightboxImageIndex(null);
        } else if (e.key === 'ArrowLeft') {
          setLightboxImageIndex(prev => prev !== null ? (prev > 0 ? prev - 1 : allImages.length - 1) : 0);
        } else if (e.key === 'ArrowRight') {
          setLightboxImageIndex(prev => prev !== null ? (prev < allImages.length - 1 ? prev + 1 : 0) : 0);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImageIndex, allImages.length, onClose]);

  if (!product) return null;

  const isNewsArticle = product.type === 'news';

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar Header */}
          <div className="px-6 py-4 border-b border-[#EAF8FF] flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF8FF] text-[#38A9E8] uppercase tracking-wider flex items-center gap-1.5">
                {product.type === 'video' && '📺 Đông Hội TV'}
                {product.type === 'audio' && '📻 Phát thanh số'}
                {product.type === 'image' && '🎨 Tác phẩm học sinh'}
                {product.type === 'gallery' && '🖼️ Album ảnh'}
                {product.type === 'digital' && '💻 Sáng tạo số'}
                {product.type === 'news' && '📰 Bản tin nhanh'}
              </span>
              <span className="text-xs text-[#24506B] font-medium hidden sm:inline">
                Lớp {product.studentClass}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-[#24506B] flex items-center justify-center transition-colors"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">

            {/* SPECIAL CASE: BẢN TIN NHANH ARTICLE LAYOUT */}
            {/* Exact Flow: Header Metadata → Ảnh đại diện → Nội dung bài → Bộ ảnh của bài viết (Responsive Gallery) */}
            {isNewsArticle ? (
              <div className="space-y-6">
                {/* Article Header info */}
                <div className="space-y-3 pb-3 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#38A9E8] text-white text-xs font-bold shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFD76A]" />
                      <span>BẢN TIN NHANH MĂNG NON</span>
                    </span>
                    {product.createdAt && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-[#38A9E8]" />
                        <span>{product.createdAt}</span>
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-[#24506B] leading-tight">
                    {product.title}
                  </h1>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-[#405866] font-medium">
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#38A9E8]" />
                        <strong className="text-[#24506B]">Ban biên tập:</strong> {product.studentName}
                      </span>
                      <span>•</span>
                      <span><strong>Lớp:</strong> {product.studentClass}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLiked(!liked)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          liked 
                            ? 'bg-red-50 text-red-500 border-red-200' 
                            : 'bg-white text-[#405866] border-gray-200 hover:border-red-300 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{(product.likes || 0) + (liked ? 1 : 0)} Yêu thích</span>
                      </button>

                      {product.facebookUrl && (
                        <a
                          href={product.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2]/10 text-[#1877F2] text-xs font-bold hover:bg-[#1877F2] hover:text-white transition-colors"
                        >
                          <Facebook className="w-3.5 h-3.5" />
                          <span>Facebook</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* 1. ẢNH ĐẠI DIỆN BÀI VIẾT (Click opens Lightbox) */}
                <div className="space-y-1.5">
                  <div 
                    onClick={() => setLightboxImageIndex(0)}
                    className="group relative w-full aspect-16/9 sm:aspect-21/9 max-h-[460px] rounded-2xl overflow-hidden bg-slate-100 border-2 border-[#70C8F3]/50 shadow-sm cursor-pointer"
                  >
                    <img 
                      src={product.thumbnail} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 rounded-full bg-black/75 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-2 shadow-lg">
                        <Maximize2 className="w-4 h-4 text-[#FFD76A]" />
                        <span>Xem ảnh kích thước lớn (Lightbox)</span>
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 text-white text-[11px] font-bold backdrop-blur-xs flex items-center gap-1.5">
                      <ImageIcon className="w-3 h-3 text-[#70C8F3]" />
                      <span>Ảnh đại diện bản tin</span>
                    </div>
                  </div>
                </div>

                {/* 2. NỘI DUNG BÀI (Full Article Body with rich formatting) */}
                <div className="bg-[#F6FCFF] p-6 rounded-2xl border border-[#EAF8FF] space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#24506B] font-bold text-xs uppercase tracking-wider border-b border-[#EAF8FF] pb-2">
                    <FileText className="w-4 h-4 text-[#38A9E8]" />
                    <span>NỘI DUNG CHI TIẾT BẢN TIN</span>
                  </div>

                  <div className="text-sm sm:text-base text-[#405866] leading-relaxed space-y-4">
                    {(product.content || product.description)
                      .split('\n\n')
                      .filter(Boolean)
                      .map((paragraph, i) => (
                        <p key={i} className="text-justify leading-relaxed whitespace-pre-line">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </div>

                {/* 3. BỘ ẢNH CỦA BÀI VIẾT (Responsive Gallery Grid) */}
                {allImages.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#EAF8FF] pb-2">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[#38A9E8]" />
                        <h3 className="text-base font-black text-[#24506B]">
                          📷 BỘ ẢNH BÀI VIẾT ({allImages.length} ảnh)
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500 italic">
                        Nhấp vào bất kỳ ảnh nào để xem toàn màn hình (Lightbox)
                      </span>
                    </div>

                    {/* Responsive Gallery Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {allImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setLightboxImageIndex(idx)}
                          className="group relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-gray-200 hover:border-[#38A9E8] shadow-xs hover:shadow-md cursor-pointer transition-all duration-300"
                        >
                          <img 
                            src={imgUrl} 
                            alt={`Ảnh bài viết ${idx + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="p-2.5 rounded-full bg-white/90 text-[#24506B] shadow-md transform group-hover:scale-110 transition-transform">
                              <Maximize2 className="w-4 h-4" />
                            </span>
                          </div>
                          <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                            Ảnh {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* NON-NEWS MEDIA DISPLAY AREA: Video, Audio, Gallery */
              <>
                <div className="bg-[#F6FCFF] rounded-2xl overflow-hidden border border-[#EAF8FF] relative shadow-inner">
                  {/* VIDEO TYPE */}
                  {product.type === 'video' && (
                    <div>
                      {youtubeEmbedUrl ? (
                        <div className="relative aspect-16/9 w-full bg-black">
                          <iframe
                            src={youtubeEmbedUrl}
                            title={product.title}
                            className="absolute inset-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : product.videoUrl && product.videoUrl.endsWith('.mp4') ? (
                        <div className="relative aspect-16/9 w-full bg-black">
                          <video 
                            src={product.videoUrl} 
                            controls 
                            autoPlay 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-16/9 w-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
                          <img 
                            src={product.thumbnail} 
                            alt={product.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xs"
                          />
                          <div className="relative z-10 max-w-md space-y-3">
                            <Tv className="w-12 h-12 text-[#FFD76A] mx-auto animate-bounce" />
                            <h4 className="text-lg font-bold text-white drop-shadow-md">
                              {product.title}
                            </h4>
                            <p className="text-xs text-slate-200">
                              Nội dung video trực tuyến chất lượng cao từ kênh truyền thông trường
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                              {product.youtubeUrl && (
                                <a
                                  href={product.youtubeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105"
                                >
                                  <Youtube className="w-4 h-4" />
                                  <span>XEM TRÊN YOUTUBE</span>
                                </a>
                              )}
                              {product.facebookUrl && (
                                <a
                                  href={product.facebookUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105"
                                >
                                  <Facebook className="w-4 h-4" />
                                  <span>XEM TRÊN FACEBOOK</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AUDIO TYPE */}
                  {product.type === 'audio' && (
                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-[#EAF8FF] to-white">
                      <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shrink-0 border-2 border-[#70C8F3] shadow-md aspect-square">
                        <img 
                          src={product.thumbnail} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#24506B]/60 to-transparent flex items-end p-3">
                          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                            Phát thanh viên: {product.studentName}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#38A9E8]/10 text-[#38A9E8] text-xs font-bold">
                          <Radio className="w-4 h-4" />
                          <span>CHƯƠNG TRÌNH PHÁT THANH MĂNG NON</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-[#24506B]">
                          {product.title}
                        </h3>
                        <p className="text-sm text-[#405866] leading-relaxed">
                          {product.description}
                        </p>
                        
                        {onPlayAudio && (
                          <button
                            onClick={() => onPlayAudio(product)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#38A9E8] hover:bg-[#24506B] text-white font-bold text-sm shadow-md transition-all active:scale-95"
                          >
                            <Radio className="w-4 h-4 animate-pulse" />
                            <span>PHÁT SỐ RADIO NÀY NGAY</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* IMAGE / GALLERY / DIGITAL TYPE */}
                  {(product.type === 'image' || product.type === 'gallery' || product.type === 'digital') && (
                    <div className="flex flex-col items-center">
                      <div 
                        onClick={() => setLightboxImageIndex(selectedImageIndex)}
                        className="group relative max-h-[500px] w-full flex items-center justify-center bg-black/5 overflow-hidden cursor-pointer"
                      >
                        <img 
                          src={allImages[selectedImageIndex]} 
                          alt={product.title}
                          className="max-h-[500px] w-auto max-w-full object-contain transition-all duration-300"
                        />

                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-3.5 py-1.5 rounded-full bg-black/70 text-white text-xs font-bold backdrop-blur-xs flex items-center gap-1.5">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Mở Lightbox toàn màn hình</span>
                          </span>
                        </div>

                        {allImages.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#24506B] flex items-center justify-center shadow-md transition-transform hover:scale-105"
                              aria-label="Ảnh trước"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#24506B] flex items-center justify-center shadow-md transition-transform hover:scale-105"
                              aria-label="Ảnh tiếp theo"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-xs">
                              {selectedImageIndex + 1} / {allImages.length}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Thumbnails strip for multi-image gallery */}
                      {allImages.length > 1 && (
                        <div className="p-3 w-full bg-white border-t border-[#EAF8FF] flex items-center gap-2 overflow-x-auto justify-center">
                          {allImages.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImageIndex(idx)}
                              className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                                selectedImageIndex === idx ? 'border-[#38A9E8] scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* PRODUCT DETAILS & CREDITS */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#24506B]">
                        {product.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#405866] mt-1.5 font-medium">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4 text-[#38A9E8]" />
                          <strong className="text-[#24506B]">Tác giả:</strong> {product.studentName}
                        </span>
                        <span>•</span>
                        <span><strong>Lớp:</strong> {product.studentClass}</span>
                        {product.createdAt && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {product.createdAt}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLiked(!liked)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          liked 
                            ? 'bg-red-50 text-red-500 border-red-200' 
                            : 'bg-white text-[#405866] border-gray-200 hover:border-red-300 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{(product.likes || 0) + (liked ? 1 : 0)} Yêu thích</span>
                      </button>

                      {product.facebookUrl && (
                        <a
                          href={product.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2]/10 text-[#1877F2] text-xs font-bold hover:bg-[#1877F2] hover:text-white transition-colors"
                        >
                          <Facebook className="w-4 h-4" />
                          <span>XEM TRÊN FACEBOOK</span>
                        </a>
                      )}

                      {product.youtubeUrl && (
                        <a
                          href={product.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <Youtube className="w-4 h-4" />
                          <span>XEM TRÊN YOUTUBE</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Description / Content Body */}
                  <div className="text-sm text-[#405866] leading-relaxed bg-[#F6FCFF] p-5 rounded-2xl border border-[#EAF8FF] space-y-3">
                    {product.content ? (
                      <div className="space-y-3 text-sm text-[#405866] leading-relaxed">
                        {product.content.split('\n\n').map((paragraph, i) => (
                          <p key={i} className="text-justify leading-relaxed">{paragraph}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="leading-relaxed">{product.description}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* LIGHTBOX COMPONENT (Full Screen Overlay) */}
      {lightboxImageIndex !== null && allImages.length > 0 && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in select-none"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxImageIndex(null);
          }}
        >
          {/* Lightbox Topbar */}
          <div 
            className="flex items-center justify-between text-white pb-3 border-b border-white/10" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                {lightboxImageIndex + 1} / {allImages.length}
              </span>
              <span className="text-sm font-semibold text-slate-200 hidden sm:inline truncate max-w-md">
                {product.title}
              </span>
            </div>

            <button
              onClick={() => setLightboxImageIndex(null)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
              aria-label="Đóng Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Center Image & Controls */}
          <div 
            className="relative flex-1 flex items-center justify-center py-4" 
            onClick={(e) => e.stopPropagation()}
          >
            {allImages.length > 1 && (
              <button
                onClick={() => setLightboxImageIndex(prev => prev !== null ? (prev > 0 ? prev - 1 : allImages.length - 1) : 0)}
                className="absolute left-2 sm:left-6 z-10 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-sm shadow-xl hover:scale-105"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            <img 
              src={allImages[lightboxImageIndex]} 
              alt={`Xem ảnh ${lightboxImageIndex + 1}`}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl transition-all duration-300" 
            />

            {allImages.length > 1 && (
              <button
                onClick={() => setLightboxImageIndex(prev => prev !== null ? (prev < allImages.length - 1 ? prev + 1 : 0) : 0)}
                className="absolute right-2 sm:right-6 z-10 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-sm shadow-xl hover:scale-105"
                aria-label="Ảnh tiếp theo"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Lightbox Bottombar */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10 gap-2" 
            onClick={(e) => e.stopPropagation()}
          >
            <span className="italic">
              Sử dụng phím mũi tên ← → để duyệt ảnh • Bấm ESC hoặc nút X để đóng
            </span>
            <span className="font-medium text-slate-300">
              Tác giả: {product.studentName} ({product.studentClass})
            </span>
          </div>
        </div>
      )}
    </>
  );
};
