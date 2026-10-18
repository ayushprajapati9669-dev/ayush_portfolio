let cloudinaryLib = null;
try {
  cloudinaryLib = require('cloudinary').v2;
  cloudinaryLib.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
  });
} catch (_err) {
  cloudinaryLib = null;
}

function isCloudinaryConfigured() {
  return Boolean(
    cloudinaryLib &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

async function uploadToCloudinary(fileBufferOrBase64, folder = 'ayush_portfolio') {
  if (!isCloudinaryConfigured()) {
    return null;
  }
  return await cloudinaryLib.uploader.upload(fileBufferOrBase64, {
    folder,
    resource_type: 'auto'
  });
}

module.exports = {
  cloudinary: cloudinaryLib,
  isCloudinaryConfigured,
  uploadToCloudinary
};
