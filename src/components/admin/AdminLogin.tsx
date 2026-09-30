import React, { useState } from 'react';
import { Lock, Shield, User, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
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
  const { user, isAdmin, adminDisplayName, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#24506B] hover:text-[#38A9E8] transition-colors bg-white px-3 py-1.5 rounded-full shadow-xs border border-[#EAF8FF]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#70C8F3]/50 shadow-card space-y-6 text-center">
        {/* School Logo */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-[#EAF8FF] p-2 border-2 border-[#70C8F3] shadow-md flex items-center justify-center">
          <img 
            src={settings.logoUrl || './assets/logo_dong_hoi.svg'} 
            alt={settings.schoolName}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-black text-[#24506B]">
            ĐĂNG NHẬP QUẢN TRỊ
          </h1>
          <p className="text-xs text-[#38A9E8] font-bold uppercase tracking-wider">
            {settings.siteName || 'PHÁT THANH MĂNG NON SỐ'}
          </p>
          <p className="text-xs text-[#405866]">
            Hệ thống quản trị nội dung CMS – Trường Tiểu học Đông Hội
          </p>
        </div>

        {/* Admin Account Identifier Notification */}
        <div className="p-3.5 bg-[#F6FCFF] rounded-2xl border border-[#EAF8FF] text-left space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#24506B]">
            <Shield className="w-4 h-4 text-[#38A9E8]" />
            <span>Tài khoản quản trị hiển thị:</span>
            <span className="px-2 py-0.5 rounded-md bg-[#EAF8FF] text-[#38A9E8] font-mono font-bold">
              {adminDisplayName}
            </span>
          </div>
          <p className="text-[11px] text-[#405866]/80 leading-relaxed">
            Hệ thống sử dụng xác thực bảo mật Firebase Authentication (Google Cloud) với email quản trị chính thức. Không lưu trữ mật khẩu tĩnh.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#38A9E8] hover:bg-[#24506B] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP VỚI GOOGLE ADMIN'}</span>
          </button>

          <p className="text-[11px] text-gray-400">
            Dành riêng cho Ban phụ trách Đội & Ban biên tập Đài phát thanh măng non
          </p>
        </div>
      </div>
    </div>
  );
};
