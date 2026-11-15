#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { loadDotEnvFile, getEnvConfig } = require('../src/config/env');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../src/config/cloudinary');
const {
  Profile,
  Project,
  Certificate,
  Setting,
  Resume,
  PortfolioState
} = require('../src/models');

loadDotEnvFile();
const config = getEnvConfig();
const repoRoot = path.resolve(__dirname, '../..');
const urlCache = new Map();

function localPathForUrl(value) {
  if (typeof value !== 'string' || !value.startsWith('/')) return null;
  if (value.startsWith('/images/')) {
    return path.join(repoRoot, 'client', 'public', value.slice('/images/'.length));
  }
  if (value.startsWith('/uploads/')) {
    return path.join(repoRoot, 'server', 'uploads', value.slice('/uploads/'.length));
  }
  return null;
}

async function toCloudinaryUrl(value) {
  const filePath = localPathForUrl(value);
  if (!filePath || !fs.existsSync(filePath)) return value;
  if (urlCache.has(value)) return urlCache.get(value);

  const fileBuffer = fs.readFileSync(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const mimeType = extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' : 'image/jpeg';
  const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
  const uploaded = await uploadToCloudinary(dataUri, 'ayush_portfolio');
  if (!uploaded || !uploaded.secure_url) {
    throw new Error(`Cloudinary returned no secure URL for ${value}`);
  }

  urlCache.set(value, uploaded.secure_url);
  console.log(`Migrated ${value} -> ${uploaded.secure_url}`);
  return uploaded.secure_url;
}

async function transform(value) {
  if (typeof value === 'string') return toCloudinaryUrl(value);
  if (Array.isArray(value)) return Promise.all(value.map(transform));
  if (!value || typeof value !== 'object') return value;
  if (Buffer.isBuffer(value) || value instanceof Date || value._bsontype) return value;

  const result = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    result[key] = await transform(nestedValue);
  }
  return result;
}

async function updateDocument(Model, document, filter) {
  if (!document) return false;
  const plain = document.toObject ? document.toObject() : { ...document };
  delete plain._id;
  delete plain.__v;
  const transformed = await transform(plain);
  await Model.updateOne(filter, { $set: transformed });
  return true;
}

async function main() {
  if (!config.mongoUri) throw new Error('MONGODB_URI is required.');
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials are required.');
  }

  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 15000 });
  const [profile, projects, certificates, setting, resumes, portfolioState] = await Promise.all([
    Profile.findOne({}),
    Project.find({}),
    Certificate.find({}),
    Setting.findOne({}),
    Resume.find({}),
    PortfolioState.findOne({ singletonKey: 'main_portfolio' })
  ]);

  await updateDocument(Profile, profile, profile ? { _id: profile._id } : null);
  for (const project of projects) await updateDocument(Project, project, { _id: project._id });
  for (const certificate of certificates) {
    await updateDocument(Certificate, certificate, { _id: certificate._id });
  }
  await updateDocument(Setting, setting, setting ? { _id: setting._id } : null);
  for (const resume of resumes) await updateDocument(Resume, resume, { _id: resume._id });
  await updateDocument(
    PortfolioState,
    portfolioState,
    portfolioState ? { _id: portfolioState._id } : null
  );

  console.log(`Cloudinary migration complete. Unique local assets processed: ${urlCache.size}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(`[Cloudinary migration] Failed: ${error.stack || error.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
