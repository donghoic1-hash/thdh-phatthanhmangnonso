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
  const { login, loginWithGoogle } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [techHelp, setTechHelp] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setTechHelp(null);

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
        if (res.errorCode === 'auth/operation-not-allowed') {
          setTechHelp(
            'Lưu ý cấu hình: Email/Password provider đang bị tắt trong Firebase Console. Quản trị viên hãy bật Email/Password trong Firebase Console (Authentication → Sign-in method) hoặc đăng nhập bằng tài khoản Google quản trị bên dưới.'
          );
        }
      }
    } catch (err) {
      console.error('[AdminLogin submit error]:', err);
      setErrorMsg('Không thể đăng nhập lúc này. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setTechHelp(null);
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(res.error || 'Đăng nhập Google không thành công.');
      }
    } catch (err) {
      console.error('[Google login error]:', err);
      setErrorMsg('Không thể đăng nhập bằng Google. Vui lòng thử lại.');
    } finally {
      setGoogleLoading(false);
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
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div className="space-y-1">
              <span>{errorMsg}</span>
              {techHelp && (
                <p className="text-[11px] text-amber-700 font-normal bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                  {techHelp}
                </p>
              )}
            </div>
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
              disabled={loading || googleLoading}
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

        {/* Alternative Google Sign-in for Admin */}
        <div className="pt-2 border-t border-gray-100 space-y-3">
          <div className="text-center">
            <span className="text-[11px] text-gray-400">hoặc</span>
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-[#24506B] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#38A9E8]" />
                <span>Đang kết nối Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Đăng nhập bằng tài khoản Google Quản trị</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
