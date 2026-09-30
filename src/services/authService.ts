/**
 * Authentication Service
 * Communicates with the secure backend authentication API.
 * Never exposes credentials, passwords, or mappings in client code.
 */

export interface AuthUser {
  id: string;
  role: string;
  displayName: string;
}

export interface AuthSessionResponse {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: AuthUser | null;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

const TOKEN_KEY = 'donghoi_admin_session_token';

export const authService = {
  /**
   * Log in with credentials
   */
  async login(username: string, password: string): Promise<LoginResult> {
    if (!username?.trim() || !password?.trim()) {
      return {
        success: false,
        error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.'
      };
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.'
        };
      }

      // Persist only the opaque session token (never the password or username)
      if (data.token) {
        try {
          sessionStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(TOKEN_KEY, data.token);
        } catch (_) {}
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (err) {
      console.error('Auth request notice:', err);
      return {
        success: false,
        error: 'Không thể đăng nhập lúc này. Vui lòng thử lại.'
      };
    }
  },

  /**
   * Verify existing session with backend
   */
  async verifySession(): Promise<AuthSessionResponse> {
    let token: string | null = null;
    try {
      token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    } catch (_) {}

    if (!token) {
      return { isAuthenticated: false, isAdmin: false, user: null };
    }

    try {
      const response = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        this.clearSessionToken();
        return { isAuthenticated: false, isAdmin: false, user: null };
      }

      const data = await response.json();
      return {
        isAuthenticated: Boolean(data.isAuthenticated),
        isAdmin: Boolean(data.isAdmin),
        user: data.user || null,
      };
    } catch (err) {
      // In case of temporary network glitch, check if token is non-empty
      return { isAuthenticated: false, isAdmin: false, user: null };
    }
  },

  /**
   * Log out and invalidate session
   */
  async logout(): Promise<void> {
    let token: string | null = null;
    try {
      token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    } catch (_) {}

    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (_) {}

    this.clearSessionToken();
  },

  clearSessionToken(): void {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (_) {}
  }
};
