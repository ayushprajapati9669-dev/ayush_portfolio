const { readJsonBody, sendJson } = require('../utils/httpUtils');
const { sanitizeText } = require('../validators/portfolioValidators');
const { hashPassword, verifyPassword, createSignedToken, generateCsrfToken } = require('../services/cryptoService');
const { getAuthSession } = require('../middleware/authMiddleware');

function createAuthController({ store, config, loginLimiter }) {
  return {
    async login(req, res) {
      const clientIp = req.socket.remoteAddress || '127.0.0.1';
      const limitCheck = loginLimiter.check(clientIp);
      if (!limitCheck.allowed) {
        return sendJson(res, 429, {
          error: 'Too many login attempts. Please wait before trying again.'
        });
      }
      if (!store.hasAnyAdmin()) {
        return sendJson(res, 503, {
          error: 'No administrator account has been bootstrapped yet. Run `npm run setup:admin` in the terminal first.'
        });
      }
      const body = await readJsonBody(req);
      const username = sanitizeText(body?.username, 80);
      const password = typeof body?.password === 'string' ? body.password : '';
      const adminUser = store.findAdminByUsername(username);
      if (!adminUser || !verifyPassword(password, adminUser.passwordHash)) {
        return sendJson(res, 401, { error: 'Invalid username or password.' });
      }
      store.recordAdminLogin(adminUser.username);
      loginLimiter.resetKey(clientIp);
      const csrfToken = generateCsrfToken();
      const sessionPayload = {
        sub: adminUser.username,
        role: 'admin',
        csrfToken,
        exp: Date.now() + config.sessionTtlMs
      };
      const signedSession = createSignedToken(sessionPayload, config.sessionSecret);
      const cookieFlags = [
        `argon_session=${encodeURIComponent(signedSession)}`,
        'HttpOnly',
        'Path=/',
        `SameSite=${config.cookieSameSite}`,
        `Max-Age=${Math.floor(config.sessionTtlMs / 1000)}`
      ];
      if (config.cookieSecure) cookieFlags.push('Secure');
      res.setHeader('Set-Cookie', cookieFlags.join('; '));
      return sendJson(res, 200, {
        authenticated: true,
        user: { username: adminUser.username, role: 'admin' },
        csrfToken
      });
    },

    logout(req, res) {
      res.setHeader(
        'Set-Cookie',
        'argon_session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0'
      );
      return sendJson(res, 200, { authenticated: false, message: 'Logged out.' });
    },

    async changePassword(req, res) {
      const session = getAuthSession(req, config);
      const csrfToken = req.headers['x-csrf-token'];
      if (!session || session.role !== 'admin') {
        return sendJson(res, 401, { error: 'Authentication required.' });
      }
      if (!csrfToken || csrfToken !== session.csrfToken) {
        return sendJson(res, 403, { error: 'Invalid or missing CSRF token.' });
      }
      const body = await readJsonBody(req);
      const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
      const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
      const adminUser = store.findAdminByUsername(session.sub);
      if (!adminUser || !verifyPassword(currentPassword, adminUser.passwordHash)) {
        return sendJson(res, 401, { error: 'Current password is incorrect.' });
      }
      try {
        store.upsertAdminUser(adminUser.username, hashPassword(newPassword));
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
      return sendJson(res, 200, { updated: true });
    },

    session(req, res) {
      const session = getAuthSession(req, config);
      if (!session) {
        return sendJson(res, 200, { authenticated: false, adminConfigured: store.hasAnyAdmin() });
      }
      return sendJson(res, 200, {
        authenticated: true,
        user: { username: session.sub, role: session.role },
        csrfToken: session.csrfToken,
        adminConfigured: true
      });
    }
  };
}

module.exports = { createAuthController };
