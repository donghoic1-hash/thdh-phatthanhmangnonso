import React, { useState } from 'react';
import { X, Search, Image as ImageIcon, Radio, Tv, Check, Plus, UploadCloud } from 'lucide-react';
import { MediaLibraryItem } from '../../types';

interface MediaPickerModalProps {
  mediaList: MediaLibraryItem[];
  filterType?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
  onAddNewMedia?: (item: Omit<MediaLibraryItem, 'id'>) => Promise<void>;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  mediaList,
  filterType,
  onSelect,
  onClose,
  onAddNewMedia,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(filterType || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New media item state
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<MediaLibraryItem['type']>('image');
  const [adding, setAdding] = useState(false);

  const filteredMedia = mediaList.filter(item => {
    const matchesCat = activeCategory === 'all' || item.type === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl || !onAddNewMedia) return;
    setAdding(true);
    try {
      await onAddNewMedia({
        name: newName,
        url: newUrl,
        type: newType,
        size: 'Tải lên trực tiếp',
        uploadedAt: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      setNewName('');
      setNewUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAF8FF] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#EAF8FF] text-[#38A9E8] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#24506B]">Thư viện Media Dùng Chung</h3>
              <p className="text-xs text-[#405866]">Chọn tệp media đã có hoặc thêm mới vào kho lưu trữ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#38A9E8] text-white text-xs font-bold hover:bg-[#24506B] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Hủy thêm' : 'Thêm tệp mới'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#24506B] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add new media form if toggled */}
        {showAddForm && (
          <form onSubmit={handleAddMedia} className="p-4 bg-[#F6FCFF] border-b border-[#EAF8FF] grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1">Tên tệp</label>
              <input
                type="text"
                placeholder="VD: Ảnh lễ khai giảng..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#38A9E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1">Loại tệp</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#38A9E8]"
              >
                <option value="image">HÌNH ẢNH</option>
                <option value="thumbnail">THUMBNAIL</option>
                <option value="cover">COVER</option>
                <option value="audio">AUDIO</option>
                <option value="video">VIDEO</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#24506B] mb-1">URL tệp / Link</label>
              <input
                type="url"
                placeholder="https://..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#38A9E8]"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={adding}
                className="w-full py-2 px-3 rounded-xl bg-[#38A9E8] hover:bg-[#24506B] text-white text-xs font-bold transition-all shadow-xs"
              >
                {adding ? 'Đang lưu...' : 'Lưu vào Thư viện'}
              </button>
            </div>
          </form>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 bg-[#F6FCFF] border-b border-[#EAF8FF] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {['all', 'image', 'audio', 'video', 'cover', 'thumbnail'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full font-bold capitalize transition-all ${
                  activeCategory === cat
                    ? 'bg-[#38A9E8] text-white'
                    : 'bg-white text-[#24506B] hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat === 'all' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm tệp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8]"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="overflow-y-auto flex-1 p-6">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12 text-[#405866]">
              <UploadCloud className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">Chưa có tệp media phù hợp.</p>
              <p className="text-xs text-gray-400">Hãy nhấn "Thêm tệp mới" để tải lên URL ảnh hoặc media.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group relative bg-[#F6FCFF] rounded-2xl overflow-hidden border border-[#EAF8FF] hover:border-[#38A9E8] shadow-xs hover:shadow-card transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                    {item.type === 'audio' ? (
                      <div className="w-full h-full bg-[#EAF8FF] flex items-center justify-center">
                        <Radio className="w-8 h-8 text-[#38A9E8]" />
                      </div>
                    ) : item.type === 'video' ? (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Tv className="w-8 h-8 text-[#FFD76A]" />
                      </div>
                    ) : (
                      <img 
                        src={item.url} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}

                    <div className="absolute inset-0 bg-[#38A9E8]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="w-9 h-9 rounded-full bg-white text-[#38A9E8] flex items-center justify-center shadow-md">
                        <Check className="w-5 h-5 font-bold" />
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5">
                    <p className="text-xs font-bold text-[#24506B] truncate" title={item.name}>
                      {item.name}
                    </p>
                    <span className="text-[10px] text-gray-400 capitalize">
                      {item.type} • {item.size}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
