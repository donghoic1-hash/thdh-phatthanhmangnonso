import React, { useState } from 'react';
import { X, Save, Trophy, Image as ImageIcon, Calendar } from 'lucide-react';
import { Competition, MediaLibraryItem } from '../../types';
import { MediaPickerModal } from './MediaPickerModal';

interface CompetitionFormModalProps {
  competition?: Competition | null;
  mediaList: MediaLibraryItem[];
  onSave: (comp: Partial<Competition>) => Promise<void>;
  onClose: () => void;
  onAddNewMedia?: (item: Omit<MediaLibraryItem, 'id'>) => Promise<void>;
}

export const CompetitionFormModal: React.FC<CompetitionFormModalProps> = ({
  competition,
  mediaList,
  onSave,
  onClose,
  onAddNewMedia,
}) => {
  const [formData, setFormData] = useState<Partial<Competition>>({
    title: competition?.title || '',
    slug: competition?.slug || '',
    subtitle: competition?.subtitle || '',
    description: competition?.description || '',
    banner: competition?.banner || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    icon: competition?.icon || 'Trophy',
    date: competition?.date || 'Học kỳ I / 2026',
    status: competition?.status || 'active',
    isPublished: competition ? competition.isPublished : true,
  });

  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const generatedSlug = formData.slug || formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'cuoc-thi-moi';
      await onSave({
        ...formData,
        id: competition?.id,
        slug: generatedSlug,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      console.error('Error saving competition:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#EAF8FF] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold text-[#24506B]">
              {competition ? 'Chỉnh sửa Cuộc thi' : 'Tạo Cuộc thi Mới'}
            </h2>
            <p className="text-xs text-[#405866]">
              Thêm sân chơi mới cho học sinh mà không cần can thiệp mã nguồn
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-[#24506B] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#24506B] mb-1">Tên cuộc thi *</label>
            <input
              type="text"
              placeholder="VD: Sáng tạo tranh vẽ Xanh 2026..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1">Mã định danh (Slug)</label>
              <input
                type="text"
                placeholder="VD: sang-tao-tranh-ve-xanh"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1">Thời gian tổ chức</label>
              <input
                type="text"
                placeholder="VD: Tháng 11/2026"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#24506B] mb-1">Mô tả ngắn cuộc thi</label>
            <textarea
              rows={3}
              placeholder="Mục đích, đối tượng tham gia và thể lệ vắn tắt..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#24506B]">Ảnh Banner Cuộc thi *</label>
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="text-xs font-bold text-[#38A9E8] hover:underline flex items-center gap-1"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Chọn từ Media</span>
              </button>
            </div>
            <input
              type="url"
              placeholder="https://..."
              value={formData.banner}
              onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
              >
                <option value="active">Đang diễn ra (Nhận bài)</option>
                <option value="completed">Đã kết thúc / Đã trao giải</option>
                <option value="upcoming">Sắp diễn ra</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1">Biểu tượng Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
              >
                <option value="Trophy">🏆 Cúp Vàng (Trophy)</option>
                <option value="Palette">🎨 Bảng màu (Palette)</option>
                <option value="Cpu">💻 Công nghệ (Cpu)</option>
                <option value="Mic">🎤 Micro Tiếng Anh (Mic)</option>
                <option value="Radio">📻 Phát thanh (Radio)</option>
                <option value="Sparkles">✨ Ngôi sao (Sparkles)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 rounded text-[#38A9E8]"
              />
              <span className="text-xs font-bold text-[#24506B]">Hiển thị công khai trên website</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#405866]"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#38A9E8] hover:bg-[#24506B] text-white text-xs font-bold shadow-md"
              >
                {saving ? 'Đang lưu...' : 'Lưu cuộc thi'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showMediaPicker && (
        <MediaPickerModal
          mediaList={mediaList}
          filterType="image"
          onSelect={(url) => setFormData(prev => ({ ...prev, banner: url }))}
          onClose={() => setShowMediaPicker(false)}
          onAddNewMedia={onAddNewMedia}
        />
      )}
    </div>
  );
};
