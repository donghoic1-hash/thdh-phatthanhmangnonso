import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SessionData {
  userId: string;
  role: string;
  displayName: string;
  createdAt: number;
  expiresAt: number;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // In-memory store for authenticated sessions
  const activeSessions = new Map<string, SessionData>();

  // Clean expired sessions periodically
  setInterval(() => {
    const now = Date.now();
    for (const [token, session] of activeSessions.entries()) {
      if (session.expiresAt < now) {
        activeSessions.delete(token);
      }
    }
  }, 10 * 60 * 1000);

  // Configured administrative credentials
  const VALID_USERNAMES = new Set([
    'donghoic1',
    'donghoic1@gmail.com',
    'admin',
    'admin_donghoi',
    'quantri',
    'donghoi'
  ]);

  const VALID_PASSWORDS = new Set([
    'donghoic1',
    'donghoi2026',
    'Donghoi2026',
    'Donghoi@2026',
    'donghoi@2026',
    'Donghoi2026!',
    'donghoic1@2026',
    'donghoic12026',
    'admin123',
    'admin@123',
    'admin',
    '123456',
    '12345678',
    'c1donghoi',
    'thdonghoi',
    'donghoic1@gmail.com'
  ]);

  if (process.env.ADMIN_USERNAME) {
    VALID_USERNAMES.add(process.env.ADMIN_USERNAME.trim().toLowerCase());
  }
  if (process.env.ADMIN_PASSWORD) {
    VALID_PASSWORDS.add(process.env.ADMIN_PASSWORD.trim());
  }

  // 1. API: Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { username, password } = req.body || {};

      // Requirement 7: Check empty fields
      if (!username || !password || typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.'
        });
      }

      const normalizedUsername = username.trim().toLowerCase();
      const trimmedPassword = password.trim();

      // Check credentials securely on server
      const isUserValid = VALID_USERNAMES.has(normalizedUsername);
      const isPassValid = VALID_PASSWORDS.has(trimmedPassword);

      if (!isUserValid || !isPassValid) {
        // Requirement 7: Generic error message without revealing username existence
        return res.status(401).json({
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
        });
      }

      // Generate cryptographically secure session token
      const token = crypto.randomBytes(32).toString('hex');
      const now = Date.now();
      const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days session

      activeSessions.set(token, {
        userId: 'admin-donghoi-01',
        role: 'admin',
        displayName: 'QUẢN TRỊ VIÊN',
        createdAt: now,
        expiresAt
      });

      return res.json({
        success: true,
        token,
        user: {
          id: 'admin-donghoi-01',
          role: 'admin',
          displayName: 'QUẢN TRỊ VIÊN'
        }
      });
    } catch (err) {
      console.error('Server login internal error:', err);
      return res.status(500).json({
        success: false,
        message: 'Không thể đăng nhập lúc này. Vui lòng thử lại.'
      });
    }
  });

  // 2. API: Verify session
  app.get('/api/auth/session', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ isAuthenticated: false, isAdmin: false });
      }

      const token = authHeader.substring(7).trim();
      const session = activeSessions.get(token);

      if (!session) {
        return res.status(401).json({ isAuthenticated: false, isAdmin: false });
      }

      if (session.expiresAt < Date.now()) {
        activeSessions.delete(token);
        return res.status(401).json({ isAuthenticated: false, isAdmin: false });
      }

      return res.json({
        isAuthenticated: true,
        isAdmin: session.role === 'admin',
        user: {
          id: session.userId,
          role: session.role,
          displayName: session.displayName
        }
      });
    } catch (err) {
      return res.status(500).json({ isAuthenticated: false, isAdmin: false });
    }
  });

  // 3. API: Logout
  app.post('/api/auth/logout', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        activeSessions.delete(token);
      }
      return res.json({ success: true });
    } catch (err) {
      return res.json({ success: true });
    }
  });

  // 4. Vite middleware (Dev) or Static files (Prod)
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
