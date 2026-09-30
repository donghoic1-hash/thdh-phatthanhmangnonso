import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

export interface AdminAuthResult {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: string;
}

/**
 * Maps input username to the corresponding Firebase Auth email identity.
 * Prevents teachers/admins from having to enter full email addresses.
 * Never exposes raw credentials in client.
 */
function resolveAuthEmail(username: string): string {
  const normalized = username.trim().toLowerCase();
  
  // Known administrative usernames
  const ADMIN_MAP: Record<string, string> = {
    'donghoic1': 'donghoic1@gmail.com',
    'admin': 'donghoic1@gmail.com',
    'quantri': 'donghoic1@gmail.com',
    'donghoi': 'donghoic1@gmail.com',
    'admin_donghoi': 'donghoic1@gmail.com',
  };

  if (ADMIN_MAP[normalized]) {
    return ADMIN_MAP[normalized];
  }

  // If already an email, return normalized
  if (normalized.includes('@')) {
    return normalized;
  }

  // Default fallback domain
  return `${normalized}@donghoi.edu.vn`;
}

/**
 * Verifies if the authenticated user has administrative privileges.
 * 1. Super Admin email match (configured in environment / firestore rules)
 * 2. Firestore /admins/{uid} document exists
 * 3. Firestore /users/{uid} document has role === 'admin'
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;

  const normalizedEmail = (user.email || '').toLowerCase().trim();
  const SUPERADMIN_EMAIL = 'donghoic1@gmail.com';

  if (normalizedEmail === SUPERADMIN_EMAIL) {
    return true;
  }

  try {
    // Check Firestore /admins/{uid}
    const adminDocRef = doc(db, 'admins', user.uid);
    const adminDocSnap = await getDoc(adminDocRef);
    if (adminDocSnap.exists()) {
      return true;
    }

    // Check Firestore /users/{uid}
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      if (data?.role === 'admin' || data?.isAdmin === true) {
        return true;
      }
    }
  } catch (err) {
    // If permission denied or other error, fallback to email check
    console.warn('[Authorization check notice]:', err instanceof Error ? err.message : err);
  }

  return false;
}

/**
 * Core Authentication Service
 */
export const authService = {
  /**
   * Log in with Username & Password via Firebase Authentication
   * @param username Tên đăng nhập (e.g., 'donghoic1' or 'admin')
   * @param password Mật khẩu
   */
  async loginAdmin(username: string, password: string): Promise<AdminAuthResult> {
    // 1. Validate inputs
    if (!username || !password || !username.trim() || !password.trim()) {
      return {
        success: false,
        error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.',
      };
    }

    // 2. Resolve authentication identity (email)
    const email = resolveAuthEmail(username);

    try {
      // 3. Call Firebase Authentication directly
      const credential = await signInWithEmailAndPassword(auth, email, password.trim());
      const firebaseUser = credential.user;

      // 4. Verify Admin authorization
      const isAdmin = await checkIsAdmin(firebaseUser);
      if (!isAdmin) {
        await signOut(auth);
        console.warn('[Auth Authorization] User is authenticated but does not have Admin privileges.');
        return {
          success: false,
          error: 'Tài khoản này không có quyền truy cập khu vực quản trị.',
          errorCode: 'auth/unauthorized-role'
        };
      }

      return {
        success: true,
        user: firebaseUser,
      };
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      const errorCode = firebaseErr?.code || 'auth/unknown-error';

      // Log technical error code in console for development debugging (NEVER LOG PASSWORD)
      console.error('[Firebase Auth Error Code]:', errorCode);

      // Return user-friendly localized messages without leaking system internals
      let userFriendlyMessage = 'Không thể đăng nhập lúc này. Vui lòng thử lại.';

      switch (errorCode) {
        case 'auth/operation-not-allowed':
          console.error(
            '[Firebase Auth Setup Required]: Email/Password provider is not enabled in Firebase Console. Go to Firebase Console -> Authentication -> Sign-in method -> Email/Password -> Enable.'
          );
          userFriendlyMessage = 'Hệ thống đăng nhập chưa được cấu hình hoàn chỉnh. Vui lòng bật Email/Password provider trong Firebase Console.';
          break;

        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
        case 'auth/invalid-email':
          userFriendlyMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác.';
          break;

        case 'auth/user-disabled':
          userFriendlyMessage = 'Tài khoản quản trị viên này đã bị tạm khóa.';
          break;

        case 'auth/too-many-requests':
          userFriendlyMessage = 'Quá nhiều lần thử không thành công. Vui lòng thử lại sau ít phút.';
          break;

        case 'auth/network-request-failed':
          userFriendlyMessage = 'Không thể kết nối tới hệ thống đăng nhập. Vui lòng kiểm tra kết nối mạng và thử lại.';
          break;

        default:
          userFriendlyMessage = 'Không thể đăng nhập lúc này. Vui lòng thử lại.';
          break;
      }

      return {
        success: false,
        error: userFriendlyMessage,
        errorCode,
      };
    }
  },

  /**
   * Optional Google Sign-In for Admin (donghoic1@gmail.com)
   * Useful when Email/Password provider is pending configuration in Firebase Console.
   */
  async loginWithGoogle(): Promise<AdminAuthResult> {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = credential.user;

      const isAdmin = await checkIsAdmin(firebaseUser);
      if (!isAdmin) {
        await signOut(auth);
        return {
          success: false,
          error: 'Tài khoản Google này không có quyền quản trị.',
          errorCode: 'auth/unauthorized-role'
        };
      }

      return {
        success: true,
        user: firebaseUser,
      };
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      const errorCode = firebaseErr?.code || 'auth/unknown-error';
      console.error('[Firebase Google Auth Error Code]:', errorCode);

      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        return { success: false, error: 'Đã hủy đăng nhập Google.' };
      }

      return {
        success: false,
        error: 'Không thể đăng nhập bằng Google. Vui lòng thử lại.',
        errorCode,
      };
    }
  },

  /**
   * Log out from Firebase Authentication
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('[Firebase SignOut Error]:', err);
    }
  }
};
