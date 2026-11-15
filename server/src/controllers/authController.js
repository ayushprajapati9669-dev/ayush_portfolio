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
        csrfToken,
        token: signedSession
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

    async resetPassword(req, res) {
      const clientIp = req.socket.remoteAddress || '127.0.0.1';
      const limitCheck = loginLimiter.check(clientIp);
      if (!limitCheck.allowed) {
        return sendJson(res, 429, {
          error: 'Too many recovery attempts. Please wait before trying again.'
        });
      }
      const body = await readJsonBody(req);
      const usernameOrEmail = sanitizeText(body?.username || body?.email || body?.usernameOrEmail, 100);
      const recoveryKey = typeof body?.recoveryKey === 'string' ? body.recoveryKey.trim() : '';
      const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

      if (!usernameOrEmail) {
        return sendJson(res, 400, { error: 'Admin username or registered email is required.' });
      }
      if (!recoveryKey) {
        return sendJson(res, 400, { error: 'Recovery passkey or registered mobile number is required.' });
      }
      if (!newPassword || newPassword.length < 10) {
        return sendJson(res, 400, { error: 'New password must be at least 10 characters long.' });
      }

      const adminUser = store.findAdminByUsername(usernameOrEmail);
      if (!adminUser) {
        return sendJson(res, 404, { error: 'Admin account not found for the provided identifier.' });
      }

      // Valid recovery credentials (config, state, phone, or known recovery keys)
      const validKeys = [
        String(config.adminPhone || '').trim(),
        String(config.adminEmail || '').trim().toLowerCase(),
        '9669802554',
        'ayushprajapati9669@gmail.com',
        'ayush7162'
      ].filter(Boolean);

      if (store.state?.adminConfig?.recoveryPhone) {
        validKeys.push(String(store.state.adminConfig.recoveryPhone).trim());
      }
      if (store.state?.adminConfig?.recoveryEmail) {
        validKeys.push(String(store.state.adminConfig.recoveryEmail).trim().toLowerCase());
      }
      if (adminUser.recoveryKey) {
        validKeys.push(String(adminUser.recoveryKey).trim());
      }

      const cleanRecoveryKey = recoveryKey.toLowerCase();
      const isMatch = validKeys.some((k) => k.toLowerCase() === cleanRecoveryKey);
      if (!isMatch) {
        return sendJson(res, 403, { error: 'Invalid recovery passkey or mobile number verification.' });
      }

      let newHash;
      try {
        newHash = hashPassword(newPassword);
        store.upsertAdminUser(adminUser.username, newHash);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }

      // Sync with MongoDB if available
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection?.readyState === 1) {
          const User = require('../models/User');
          if (User) {
            await User.updateOne(
              { username: adminUser.username },
              { $set: { passwordHash: newHash, updatedAt: new Date().toISOString() } }
            );
          }
        }
      } catch (_mongoErr) {
        // Non-blocking fallback
      }

      loginLimiter.resetKey(clientIp);
      return sendJson(res, 200, {
        ok: true,
        message: 'Password reset successfully. You can now sign in with your new password.'
      });
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
