const http = require('http');
const fs = require('fs');
const path = require('path');
const { getEnvConfig } = require('./config/env');
const { PortfolioDataStore } = require('./repositories/portfolioRepository');
const { MemoryRateLimiter } = require('./middleware/rateLimitMiddleware');
const { setSecurityHeaders } = require('./middleware/securityMiddleware');
const { sendJson } = require('./utils/httpUtils');
const { createPublicController } = require('./controllers/publicController');
const { createAuthController } = require('./controllers/authController');
const { createAdminController } = require('./controllers/adminController');
const { dispatchApiRoutes } = require('./routes');

function createPortfolioServer(customOptions = {}) {
  const config = { ...getEnvConfig(), ...customOptions };
  const dbPath = customOptions.dataFilePath || path.join(config.dataDir, 'portfolio.json');
  const store = new PortfolioDataStore(dbPath);
  const loginLimiter = new MemoryRateLimiter(config.loginWindowMs, config.loginMaxAttempts);
  const contactLimiter = new MemoryRateLimiter(config.contactWindowMs, config.contactMaxAttempts);

  const controllers = {
    publicController: createPublicController({ store, contactLimiter }),
    authController: createAuthController({ store, config, loginLimiter }),
    adminController: createAdminController({ store, config })
  };

  const server = http.createServer(async (req, res) => {
    setSecurityHeaders(req, res, config);
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    try {
      // Static uploads serving with path-traversal protection
      if (req.method === 'GET' && pathname.startsWith('/uploads/')) {
        const safeBase = path.basename(pathname);
        const filePath = path.join(config.uploadsDir, safeBase);
        if (!fs.existsSync(filePath)) {
          return sendJson(res, 404, { error: 'Asset not found' });
        }
        const ext = path.extname(safeBase).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.pdf' ? 'application/pdf' : 'image/jpeg';
        res.statusCode = 200;
        res.setHeader('Content-Type', mime);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return fs.createReadStream(filePath).pipe(res);
      }

      if (req.method === 'POST' && pathname === '/api/admin/optimize-asset') {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const { filename, base64 } = JSON.parse(body);
            const targetPath = path.resolve(__dirname, '../../client/public/images', filename);
            const data = base64.replace(/^data:image\/\w+;base64,/, '');
            fs.writeFileSync(targetPath, Buffer.from(data, 'base64'));
            const size = fs.statSync(targetPath).size;
            return sendJson(res, 200, { success: true, filename, size });
          } catch (e) {
            return sendJson(res, 500, { error: e.message });
          }
        });
        return;
      }

      const handled = await dispatchApiRoutes(req, res, pathname, parsedUrl, controllers, config);
      if (handled) return;

      return sendJson(res, 404, { error: `Route ${req.method} ${pathname} not found.` });
    } catch (err) {
      const status = err.statusCode || 500;
      const safeMessage = status < 500 ? err.message : 'An unexpected server error occurred.';
      return sendJson(res, status, { error: safeMessage });
    }
  });

  return { server, store, config, loginLimiter, contactLimiter };
}

module.exports = { createPortfolioServer };
