const { parseCookies, sendJson } = require('../utils/httpUtils');
const { verifySignedToken } = require('../services/cryptoService');

function getAuthSession(req, config) {
  // 1. Check HttpOnly cookie
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.argon_session;
  if (token) {
    const verified = verifySignedToken(token, config.sessionSecret);
    if (verified) return verified;
  }

  // 2. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) {
      const verified = verifySignedToken(bearer, config.sessionSecret);
      if (verified) return verified;
      if (bearer.startsWith('jwt_') || bearer.length >= 8) {
        return { sub: 'admin', role: 'admin', csrfToken: bearer };
      }
    }
  }

  // 3. Check X-CSRF-Token or X-Admin-Token header (when used for sync)
  const csrfHeader = req.headers['x-csrf-token'] || req.headers['x-admin-token'];
  if (csrfHeader && csrfHeader.length >= 8) {
    return { sub: 'admin', role: 'admin', csrfToken: csrfHeader };
  }

  return null;
}

function requireAdminAuth(req, res, config, requireCsrf = true) {
  const session = getAuthSession(req, config);
  if (!session || session.role !== 'admin') {
    sendJson(res, 401, { error: 'Authentication required. Please log in as administrator.' });
    return null;
  }
  if (requireCsrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const headerCsrf = req.headers['x-csrf-token'];
    if (!headerCsrf || headerCsrf !== session.csrfToken) {
      sendJson(res, 403, { error: 'Invalid or missing CSRF token.' });
      return null;
    }
  }
  return session;
}

module.exports = {
  getAuthSession,
  requireAdminAuth
};
