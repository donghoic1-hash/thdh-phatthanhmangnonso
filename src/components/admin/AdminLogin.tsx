import React, { useState } from 'react';
import { Lock, ArrowLeft, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SiteSettings } from '../../types';

interface AdminLoginProps {
  settings: SiteSettings;
  onNavigateHome: () => void;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  settings,
  onNavigateHome,
  onLoginSuccess,
}) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate inputs
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(username.trim(), password.trim());
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(res.error || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      setErrorMsg('Không thể đăng nhập lúc này. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF8FF] via-[#F6FCFF] to-white flex flex-col items-center justify-center p-4">
      {/* Return button */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#24506B] hover:text-[#38A9E8] transition-colors bg-white px-3.5 py-2 rounded-full shadow-xs border border-[#EAF8FF]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 border-2 border-[#70C8F3]/50 shadow-card space-y-6">
        {/* School Logo & Title */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#EAF8FF] p-2 border-2 border-[#70C8F3] shadow-md flex items-center justify-center">
            <img 
              src={settings.logoUrl || './assets/logo_dong_hoi.svg'} 
              alt={settings.schoolName}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = './assets/logo_dong_hoi.svg';
              }}
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#24506B]">
              ĐĂNG NHẬP QUẢN TRỊ
            </h1>
            <p className="text-xs text-[#38A9E8] font-bold uppercase tracking-wider">
              {settings.siteName || 'PHÁT THANH MĂNG NON SỐ'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form strictly as requested */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: TÊN ĐĂNG NHẬP */}
          <div>
            <label className="block text-xs font-bold text-[#24506B] uppercase mb-1.5">
              TÊN ĐĂNG NHẬP
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8] focus:ring-2 focus:ring-[#38A9E8]/20 text-sm text-[#24506B]"
            />
          </div>

          {/* Field 2: MẬT KHẨU */}
          <div>
            <label className="block text-xs font-bold text-[#24506B] uppercase mb-1.5">
              MẬT KHẨU
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 focus:outline-none focus:border-[#38A9E8] focus:ring-2 focus:ring-[#38A9E8]/20 text-sm text-[#24506B]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#24506B] p-1 transition-colors"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Checkbox: Hiển thị mật khẩu */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="show-pwd-checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="w-4 h-4 rounded text-[#38A9E8] border-gray-300 focus:ring-[#38A9E8] cursor-pointer"
            />
            <label htmlFor="show-pwd-checkbox" className="text-xs text-[#405866] cursor-pointer select-none">
              Hiển thị mật khẩu
            </label>
          </div>

          {/* Button: ĐĂNG NHẬP */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#38A9E8] hover:bg-[#24506B] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ĐANG ĐĂNG NHẬP...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>ĐĂNG NHẬP</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
