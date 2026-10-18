const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../config/cloudinary');

async function persistMediaUpload(payload, config) {
  const ext = payload.mimeType === 'image/png' ? '.png' : payload.mimeType === 'image/webp' ? '.webp' : '.jpg';
  const safeFilename = `asset-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  if (!fs.existsSync(config.uploadsDir)) {
    fs.mkdirSync(config.uploadsDir, { recursive: true });
  }
  const rawBase64 = payload.base64Data.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
  const buf = Buffer.from(rawBase64, 'base64');
  fs.writeFileSync(path.join(config.uploadsDir, safeFilename), buf);

  let url = `/uploads/${safeFilename}`;
  if (isCloudinaryConfigured()) {
    try {
      const cloudRes = await uploadToCloudinary(payload.base64Data, 'ayush_portfolio');
      if (cloudRes && cloudRes.secure_url) {
        url = cloudRes.secure_url;
      }
    } catch (_err) {
      // Fallback to local /uploads URL if Cloudinary is unreachable
    }
  }

  return {
    filename: safeFilename,
    sizeBytes: buf.length,
    url
  };
}

module.exports = { persistMediaUpload };
