import React, { useState, useRef } from 'react';
import { 
  X, 
  Save, 
  Eye, 
  Image as ImageIcon, 
  UploadCloud, 
  Radio, 
  Tv, 
  FileText, 
  Sparkles,
  Link as LinkIcon,
  CheckCircle,
  HelpCircle,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Star,
  Plus,
  Loader2
} from 'lucide-react';
import { Product, Competition, MediaLibraryItem } from '../../types';
import { MediaPickerModal } from './MediaPickerModal';
import { processImageFile, uploadImageFile } from '../../utils/imageUtils';

interface ProductFormModalProps {
  product?: Product | null;
  competitions: Competition[];
  mediaList: MediaLibraryItem[];
  onSave: (product: Partial<Product>) => Promise<void>;
  onClose: () => void;
  onAddNewMedia?: (item: Omit<MediaLibraryItem, 'id'>) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  competitions,
  mediaList,
  onSave,
  onClose,
  onAddNewMedia,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    title: product?.title || '',
    type: product?.type || 'news',
    studentName: product?.studentName || '',
    studentClass: product?.studentClass || '5A1',
    description: product?.description || '',
    content: product?.content || '',
    thumbnail: product?.thumbnail || '',
    mediaUrl: product?.mediaUrl || '',
    audioUrl: product?.audioUrl || '',
    videoUrl: product?.videoUrl || '',
    facebookUrl: product?.facebookUrl || '',
    youtubeUrl: product?.youtubeUrl || '',
    category: product?.category || 'ban-tin-nhanh',
    competitionId: product?.competitionId || '',
    duration: product?.duration || '04:00',
    isPublished: product ? product.isPublished : true,
    isFeatured: product ? product.isFeatured : false,
  });

  // State for all article photos in images[]
  const [imagesList, setImagesList] = useState<string[]>(
    product?.images && product.images.length > 0
      ? [...product.images]
      : product?.thumbnail
      ? [product.thumbnail]
      : []
  );

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [saving, setSaving] = useState(false);
  
  const albumFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [pickerTargetField, setPickerTargetField] = useState<'thumbnail' | 'audioUrl' | 'videoUrl' | 'album'>('thumbnail');

  // Handle multiple image uploads from device
  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const filesArray = Array.from(files);
    const newUrls: string[] = [];

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      setUploadStatusText(`Đang xử lý ảnh ${i + 1}/${filesArray.length}: ${file.name}...`);
      try {
        const uploadedUrl = await uploadImageFile(file, 'news');
        newUrls.push(uploadedUrl);

        if (onAddNewMedia) {
          await onAddNewMedia({
            name: `Ảnh bài viết - ${file.name}`,
            type: 'image',
            url: uploadedUrl,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            uploadedAt: new Date().toISOString().split('T')[0],
          });
        }
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }

    setImagesList(prev => [...prev, ...newUrls]);
    setUploadingImages(false);
    setUploadStatusText('');
    e.target.value = '';
  };

  // Handle single thumbnail upload from device
  const handleSingleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadImageFile(file, 'thumbnails');
      setFormData(prev => ({
        ...prev,
        thumbnail: uploadedUrl,
        mediaUrl: uploadedUrl
      }));

      // Also ensure it is in imagesList
      setImagesList(prev => prev.includes(uploadedUrl) ? prev : [uploadedUrl, ...prev]);

      if (onAddNewMedia) {
        await onAddNewMedia({
          name: `Thumbnail - ${file.name}`,
          type: 'thumbnail',
          url: uploadedUrl,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error('Error processing thumbnail:', err);
    }
    e.target.value = '';
  };

  // Remove photo from imagesList
  const handleRemoveImage = (indexToRemove: number) => {
    setImagesList(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Move image left in order
  const handleMoveImage = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= imagesList.length) return;
    const updated = [...imagesList];
    const temp = updated[fromIndex];
    updated[fromIndex] = updated[toIndex];
    updated[toIndex] = temp;
    setImagesList(updated);
  };

  // Set as primary thumbnail
  const handleSetAsPrimary = (imgUrl: string) => {
    setFormData(prev => ({ ...prev, thumbnail: imgUrl, mediaUrl: imgUrl }));
    // Move to first position in array
    setImagesList(prev => [imgUrl, ...prev.filter(url => url !== imgUrl)]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Determine primary thumbnail if not explicitly selected
      const finalThumbnail = formData.thumbnail || (imagesList.length > 0 ? imagesList[0] : 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80');

      await onSave({
        ...formData,
        id: product?.id,
        thumbnail: finalThumbnail,
        mediaUrl: finalThumbnail,
        images: imagesList,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setSaving(false);
    }
  };

  const openPickerFor = (field: 'thumbnail' | 'audioUrl' | 'videoUrl' | 'album') => {
    setPickerTargetField(field);
    setShowMediaPicker(true);
  };

  const handleMediaPicked = (url: string) => {
    if (pickerTargetField === 'album') {
      setImagesList(prev => [...prev, url]);
      return;
    }
    setFormData(prev => ({
      ...prev,
      [pickerTargetField]: url,
      ...(pickerTargetField === 'thumbnail' ? { mediaUrl: url } : {})
    }));
    if (pickerTargetField === 'thumbnail') {
      setImagesList(prev => prev.includes(url) ? prev : [url, ...prev]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAF8FF] flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-[#24506B]">
              {product ? 'Chỉnh sửa sản phẩm học sinh' : 'Đăng tải sản phẩm mới'}
            </h2>
            <p className="text-xs text-[#405866]">
              Tạo bài viết Bản tin nhanh, số phát thanh măng non hoặc video Đông Hội TV
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-[#24506B] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* 1. Core classification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#F6FCFF] border border-[#EAF8FF]">
            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1.5">
                Loại sản phẩm *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white font-semibold focus:outline-none focus:border-[#38A9E8]"
                required
              >
                <option value="news">📰 Bản tin nhanh (Bài viết + Nhiều hình ảnh)</option>
                <option value="video">📺 Đông Hội TV (Video 16:9)</option>
                <option value="audio">📻 Phát thanh Măng non số (Audio 1:1)</option>
                <option value="image">🎨 Tác phẩm tranh / Mặt nạ (Hình ảnh)</option>
                <option value="gallery">🖼️ Album bộ ảnh học sinh</option>
                <option value="digital">💻 Sáng tạo số / Scratch / Đồ họa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1.5">
                Cuộc thi / Chuyên mục
              </label>
              <select
                value={formData.competitionId || ''}
                onChange={(e) => setFormData({ ...formData, competitionId: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white font-medium focus:outline-none focus:border-[#38A9E8]"
              >
                <option value="">-- Chọn cuộc thi nếu có --</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏆 {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1.5">
                Thời lượng (nếu là Audio/Video)
              </label>
              <input
                type="text"
                placeholder="VD: 04:30"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#38A9E8]"
              />
            </div>
          </div>

          {/* 2. Title & Student info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1.5">
                Tiêu đề bài viết / Tên tác phẩm *
              </label>
              <input
                type="text"
                placeholder="VD: Bản tin nhanh: Sôi nổi Ngày hội Thể thao Măng non Đông Hội..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#24506B] mb-1.5">
                  Tác giả / Học sinh / CLB thực hiện *
                </label>
                <input
                  type="text"
                  placeholder="VD: CLB Phóng viên nhỏ hoặc Nguyễn Minh Châu"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24506B] mb-1.5">
                  Lớp / Khối lớp *
                </label>
                <input
                  type="text"
                  placeholder="VD: 5A1 hoặc Khối 5"
                  value={formData.studentClass}
                  onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1.5">
                Mô tả ngắn tóm tắt bài viết *
              </label>
              <textarea
                rows={2}
                placeholder="Tóm tắt ngắn gọn sự kiện, ý nghĩa thông điệp bài viết..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
                required
              />
            </div>

            {/* Content field: Full Article Body */}
            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1.5">
                Nội dung bài viết chi tiết (Hỗ trợ định dạng đoạn văn, xuống dòng)
              </label>
              <textarea
                rows={5}
                placeholder="Nhập toàn văn bài viết, diễn biến hoạt động học đường, cảm xúc của thầy cô và học sinh... (Cách 1 dòng trống để tạo đoạn văn mới)"
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8] leading-relaxed"
              />
            </div>
          </div>

          {/* 3. MULTI-IMAGE ALBUM / 📷 HÌNH ẢNH BÀI VIẾT (CRITICAL REQUIREMENT 1) */}
          <div className="p-5 rounded-2xl bg-[#F6FCFF] border-2 border-[#70C8F3]/60 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAF8FF] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-[#24506B] flex items-center gap-2">
                  <span>📷 HÌNH ẢNH BÀI VIẾT</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#38A9E8] text-white">
                    {imagesList.length} ảnh
                  </span>
                </span>
              </div>

              {/* Upload & Select buttons */}
              <div className="flex items-center gap-2">
                {/* Hidden multiple file input */}
                <input
                  type="file"
                  ref={albumFileInputRef}
                  multiple
                  onChange={handleMultipleFilesUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => albumFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#38A9E8] hover:bg-[#24506B] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>+ TẢI ẢNH LÊN</span>
                </button>

                <button
                  type="button"
                  onClick={() => openPickerFor('album')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#24506B] text-xs font-bold transition-all"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Chọn từ Media</span>
                </button>
              </div>
            </div>

            {/* Upload progress indicator */}
            {uploadingImages && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 text-xs text-blue-700 font-semibold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-[#38A9E8]" />
                <span>{uploadStatusText || 'Đang tải lên và tối ưu hóa hình ảnh...'}</span>
              </div>
            )}

            {/* Preview Grid for ALL images */}
            {imagesList.length === 0 ? (
              <div 
                onClick={() => albumFileInputRef.current?.click()}
                className="border-2 border-dashed border-[#70C8F3]/60 rounded-2xl p-8 text-center cursor-pointer hover:bg-white transition-all space-y-2"
              >
                <UploadCloud className="w-10 h-10 text-[#38A9E8] mx-auto opacity-70" />
                <p className="text-xs font-bold text-[#24506B]">Chưa có hình ảnh nào trong bài viết</p>
                <p className="text-[11px] text-[#405866]">
                  Nhấn vào nút <strong>"+ TẢI ẢNH LÊN"</strong> để chọn và tải lên nhiều ảnh cùng lúc từ thiết bị của bạn.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imagesList.map((imgUrl, idx) => {
                    const isCover = idx === 0 || imgUrl === formData.thumbnail;

                    return (
                      <div
                        key={idx}
                        className={`group relative bg-white rounded-2xl overflow-hidden border transition-all shadow-xs flex flex-col ${
                          isCover ? 'border-2 border-[#38A9E8] ring-2 ring-[#38A9E8]/20' : 'border-gray-200 hover:border-[#70C8F3]'
                        }`}
                      >
                        <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                          <img src={imgUrl} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {/* Image Index badge */}
                          <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center backdrop-blur-xs">
                            {idx + 1}
                          </span>

                          {/* Cover badge if first */}
                          {isCover && (
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FFD76A] text-[#24506B] shadow-xs">
                              ★ Ảnh bìa bài
                            </span>
                          )}

                          {/* Delete button (X) */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110"
                            title="Xóa ảnh này khỏi bài viết"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Action footer for each photo: Reorder & Set as cover */}
                        <div className="p-1.5 bg-gray-50 flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, 'left')}
                              className="p-1 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                              title="Chuyển ảnh sang trái"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === imagesList.length - 1}
                              onClick={() => handleMoveImage(idx, 'right')}
                              className="p-1 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                              title="Chuyển ảnh sang phải"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => handleSetAsPrimary(imgUrl)}
                              className="text-[#38A9E8] font-bold hover:underline"
                            >
                              Đặt làm ảnh bìa
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span>✓ Bạn có thể dùng mũi tên để đổi thứ tự ảnh hoặc nhấn "Xóa" để loại bỏ ảnh không mong muốn.</span>
                  <button
                    type="button"
                    onClick={() => albumFileInputRef.current?.click()}
                    className="text-[#38A9E8] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm ảnh tiếp</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Additional Media links (Audio/Video/Facebook/YouTube) */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAF8FF] space-y-4">
            <h4 className="text-xs font-bold text-[#24506B] uppercase tracking-wide">
              Đường dẫn Media phụ trợ (Tùy chọn)
            </h4>

            {formData.type === 'audio' && (
              <div>
                <label className="block text-xs font-bold text-[#24506B] mb-1">
                  Đường dẫn Audio (MP3 / OGG)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.audioUrl || ''}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => openPickerFor('audioUrl')}
                    className="px-3 py-1.5 rounded-xl bg-[#EAF8FF] text-[#38A9E8] text-xs font-bold"
                  >
                    Chọn audio
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#24506B] mb-1">
                  Link Video YouTube (nếu có)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.youtubeUrl || ''}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24506B] mb-1">
                  Link Facebook bài viết (nếu có)
                </label>
                <input
                  type="url"
                  placeholder="https://www.facebook.com/..."
                  value={formData.facebookUrl || ''}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* 5. Publication Status & Featured Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#F6FCFF] border border-[#EAF8FF]">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-[#38A9E8] accent-[#38A9E8]"
                />
                <span className="text-xs font-bold text-[#24506B]">
                  {formData.isPublished ? 'Trạng thái: ĐÃ XUẤT BẢN' : 'Trạng thái: BẢN NHÁP'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#38A9E8] accent-[#38A9E8]"
                />
                <span className="text-xs font-bold text-[#24506B]">
                  Đặt làm Sản phẩm nổi bật
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#405866] hover:bg-gray-100 transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={saving || uploadingImages}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#38A9E8] hover:bg-[#24506B] text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Đang lưu bài...' : 'Xuất bản bài viết'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Shared Media Picker Modal */}
      {showMediaPicker && (
        <MediaPickerModal
          mediaList={mediaList}
          filterType={pickerTargetField === 'audioUrl' ? 'audio' : 'image'}
          onSelect={handleMediaPicked}
          onClose={() => setShowMediaPicker(false)}
          onAddNewMedia={onAddNewMedia}
        />
      )}
    </div>
  );
};
