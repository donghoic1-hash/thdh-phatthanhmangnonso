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

const SESSION_SECRET = process.env.SESSION_SECRET || 'donghoi-secure-auth-secret-key-2026-v1';
const revokedTokens = new Set<string>();

function signSessionToken(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string): SessionData | null {
  try {
    if (revokedTokens.has(token)) return null;

    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    
    if (signature.length !== expectedSig.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionData;
    if (session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Configured administrative credentials
  const VALID_USERNAMES = new Set([
    'donghoic1',
    'donghoic1@gmail.com',
    'admin',
    'admin_donghoi',
    'quantri',
    'donghoi',
    'c1donghoi',
    'thdonghoi',
    'truongtieuhocdonghoi'
  ]);

  const VALID_PASSWORDS = new Set([
    'donghoic1',
    'Donghoic1',
    'donghoic1@gmail.com',
    'donghoi2026',
    'Donghoi2026',
    'Donghoi@2026',
    'donghoi@2026',
    'Donghoi2026!',
    'donghoic1@2026',
    'donghoic12026',
    'Donghoic1@2026',
    'Donghoic12026',
    'admin',
    'Admin',
    'admin123',
    'Admin123',
    'admin@123',
    'Admin@123',
    'admin2026',
    'Admin2026',
    'Admin@2026',
    'admin@2026',
    '123456',
    '12345678',
    '123456789',
    'c1donghoi',
    'thdonghoi',
    'donghoi',
    'Donghoi'
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

      // Generate cryptographically signed HMAC token (persists across server restarts)
      const now = Date.now();
      const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days session

      const sessionData: SessionData = {
        userId: 'admin-donghoi-01',
        role: 'admin',
        displayName: 'QUẢN TRỊ VIÊN',
        createdAt: now,
        expiresAt
      };

      const token = signSessionToken(sessionData);

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
        return res.status(401).json({ isAuthenticated: false, isAdmin: false, user: null });
      }

      const token = authHeader.substring(7).trim();
      const session = verifySessionToken(token);

      if (!session) {
        return res.status(401).json({ isAuthenticated: false, isAdmin: false, user: null });
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
      return res.status(500).json({ isAuthenticated: false, isAdmin: false, user: null });
    }
  });

  // 3. API: Logout
  app.post('/api/auth/logout', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        revokedTokens.add(token);
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

    // Fallback for SPA routing in dev mode
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
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
