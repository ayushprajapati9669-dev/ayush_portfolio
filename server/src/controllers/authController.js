const { readJsonBody, sendJson } = require('../utils/httpUtils');
const { sanitizeText } = require('../validators/portfolioValidators');
const { verifyPassword, createSignedToken, generateCsrfToken } = require('../services/cryptoService');
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
