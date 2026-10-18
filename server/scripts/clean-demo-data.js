#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { getEnvConfig } = require('../src/config/env');
const {
  Project,
  Certificate,
  Message
} = require('../src/models/mongoModels');
const PortfolioState = require('../src/models/PortfolioState');

let mongoose = null;
try {
  mongoose = require('mongoose');
} catch (_err) {
  mongoose = null;
}

async function cleanDemoData() {
  console.log('[Clean Demo] Starting cleanup of demo data...');

  const config = getEnvConfig();

  // 1. Clean local JSON file
  const localDbPath = path.join(config.dataDir, 'portfolio.json');
  if (fs.existsSync(localDbPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
      data.projects = [];
      data.certificates = [];
      data.messages = [];
      data.media = [];
      fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf8');
      console.log('✓ Cleared demo projects, certificates, messages from local portfolio.json');
    } catch (e) {
      console.warn('Local file cleanup notice:', e.message);
    }
  }

  // 2. Clean MongoDB Atlas collections
  if (mongoose && config.mongoUri) {
    try {
      await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
      console.log('✓ Connected to MongoDB Atlas');

      const pRes = await Project.deleteMany({});
      const cRes = await Certificate.deleteMany({});
      const mRes = await Message.deleteMany({});

      if (PortfolioState) {
        await PortfolioState.updateMany({}, {
          $set: {
            projects: [],
            certificates: [],
            messages: []
          }
        });
      }

      console.log(`✓ MongoDB Atlas collections cleared:
   - projects deleted: ${pRes.deletedCount}
   - certificates deleted: ${cRes.deletedCount}
   - messages deleted: ${mRes.deletedCount}`);

      await mongoose.disconnect();
    } catch (err) {
      console.warn('MongoDB Atlas cleanup notice:', err.message);
    }
  }

  console.log('✓ Cleanup complete! Database and local store now start completely empty of demo data.');
  process.exit(0);
}

cleanDemoData();
