const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadDotEnvFile() {
  const rootEnv = path.join(__dirname, '../../../.env');
  const serverEnv = path.join(__dirname, '../../.env');
  try {
    const dotenv = require('dotenv');
    if (fs.existsSync(serverEnv)) {
      dotenv.config({ path: serverEnv });
    }
    if (fs.existsSync(rootEnv)) {
      dotenv.config({ path: rootEnv });
    }
  } catch (_e) {
    // Native fallback loader
    for (const p of [serverEnv, rootEnv]) {
      if (fs.existsSync(p)) {
        const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[key]) process.env[key] = val;
          }
        }
      }
    }
  }
}

loadDotEnvFile();

function getEnvConfig() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '6000', 10),
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5174',
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayush_portfolio',
    allowFileFallback: (process.env.ALLOW_FILE_DB_FALLBACK || 'true').toLowerCase() === 'true',
    sessionSecret: process.env.SESSION_SECRET || process.env.JWT_SECRET || crypto.createHash('sha256').update(process.cwd() + '-argon-dev-secret').digest('hex'),
    cookieSecure: (process.env.COOKIE_SECURE || 'false').toLowerCase() === 'true',
    cookieSameSite: process.env.COOKIE_SAMESITE || 'Strict',
    sessionTtlMs: parseInt(process.env.SESSION_TTL_HOURS || '12', 10) * 3600 * 1000,
    loginWindowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000', 10),
    loginMaxAttempts: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5', 10),
    contactWindowMs: parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW_MS || '3600000', 10),
    contactMaxAttempts: parseInt(process.env.CONTACT_RATE_LIMIT_MAX || '5', 10),
    maxUploadBytes: parseInt(process.env.MAX_UPLOAD_BYTES || '5242880', 10),
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
    adminEmail: process.env.ADMIN_EMAIL || 'ayushprajapati9669@gmail.com',
    adminPhone: process.env.ADMIN_PHONE || '9669802554',
    dataDir: process.env.DATA_DIR || path.join(__dirname, '../../data'),
    uploadsDir: process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads')
  };
}

module.exports = { getEnvConfig, loadDotEnvFile };
