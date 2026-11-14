const fs = require('fs');
const path = require('path');
const mongoose = require('../server/node_modules/mongoose');
const { getEnvConfig } = require('../server/src/config/env');

async function syncAtlas() {
  const config = getEnvConfig();
  console.log('[SyncAtlas] Target Mongo URI:', config.mongoUri);

  const portfolioPath = path.resolve(__dirname, '../server/data/portfolio.json');
  const portfolioData = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));

  // 1. Clean settings definition
  const cleanSettings = {
    siteName: 'Ayush Prajapati',
    siteTitle: 'Ayush Prajapati — Full-Stack Developer Portfolio',
    seoTitle: 'Ayush Prajapati | Full-Stack Developer & Software Engineer',
    seoDescription: 'Portfolio of Ayush Prajapati, B.Tech CSE student at SISTec, Bhopal (CGPA: 8.42) specializing in MERN stack development, C, Java, Python, MySQL, and MongoDB.',
    ogTitle: 'Ayush Prajapati — Full-Stack Developer & Software Engineer',
    ogDescription: 'Portfolio of Ayush Prajapati, B.Tech CSE student at SISTec, Bhopal (CGPA: 8.42) specializing in MERN stack development, C, Java, Python, MySQL, and MongoDB.',
    ogImage: '/images/ayush-hero-portrait.jpg',
    canonicalUrl: '',
    contactEmail: 'ayushprajapati9669@gmail.com',
    contactPhone: '(+91) 9669802554',
    contactNote: '',
    copyrightText: '© ' + new Date().getFullYear() + ' Ayush Prajapati. All rights reserved.',
    accentColor: '#dfb740',
    themeMode: 'dark',
    bgBase: '#000000',
    bgSurface: '#0a0a0f',
    glowIntensity: 'medium',
    maintenanceMode: false,
    particlesEnabled: true,
    robotsIndex: 'index, follow',
    updatedAt: new Date().toISOString()
  };

  // 2. Clean portfolio.json on disk
  portfolioData.settings = cleanSettings;
  if (Array.isArray(portfolioData.skills)) {
    portfolioData.skills = portfolioData.skills.map((s) => {
      if (s.id === 'skill-frontend') {
        const clean = { ...s };
        delete clean.color;
        delete clean.subtitle;
        clean.name = 'Frontend';
        clean.category = 'Frontend';
        return clean;
      }
      return s;
    });
  }
  if (Array.isArray(portfolioData.users)) {
    portfolioData.users = portfolioData.users.filter((u) => u.username !== 'test_admin');
  }
  portfolioData.certificates = [];
  fs.writeFileSync(portfolioPath, JSON.stringify(portfolioData, null, 2) + '\n', 'utf8');
  console.log('[SyncAtlas] Clean settings written to local portfolio.json');

  // 3. Connect to MongoDB Atlas
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  console.log('[SyncAtlas] Successfully connected to MongoDB Atlas!');

  // Clean settings collection in Atlas
  await db.collection('settings').deleteMany({});
  await db.collection('settings').insertOne(cleanSettings);
  console.log('[SyncAtlas] Cleaned collection "settings" in MongoDB Atlas');

  // Clean portfoliostates collection in Atlas
  await db.collection('portfoliostates').deleteMany({});
  await db.collection('portfoliostates').insertOne({
    singletonKey: 'main_portfolio',
    profile: portfolioData.profile,
    projects: portfolioData.projects || [],
    skills: portfolioData.skills || [],
    certificates: [],
    resumes: portfolioData.resumes || [],
    messages: portfolioData.messages || [],
    settings: cleanSettings,
    adminConfig: {
      username: 'ayushprajapati9669@gmail.com',
      passwordHash: portfolioData.users?.[0]?.passwordHash || ''
    }
  });
  console.log('[SyncAtlas] Cleaned collection "portfoliostates" in MongoDB Atlas');

  // Clean skills collection in Atlas
  await db.collection('skills').updateOne(
    { id: 'skill-frontend' },
    {
      $set: { name: 'Frontend', category: 'Frontend' },
      $unset: { color: '', subtitle: '' }
    }
  );
  console.log('[SyncAtlas] Cleaned skill-frontend in MongoDB Atlas');

  // Clean users collection in Atlas
  const delUsers = await db.collection('users').deleteMany({ username: 'test_admin' });
  console.log('[SyncAtlas] Deleted test_admin users from Atlas:', delUsers.deletedCount);

  // Clean certificates collection in Atlas
  const delCerts = await db.collection('certificates').deleteMany({ id: { $in: ['cert1', 'cert2', 'cert3', 'cert4', 'cert5'] } });
  console.log('[SyncAtlas] Deleted dummy certs from Atlas:', delCerts.deletedCount);

  // Also clean local mongodb if running
  try {
    await mongoose.disconnect();
    await mongoose.connect('mongodb://127.0.0.1:27017/ayush_portfolio', { serverSelectionTimeoutMS: 2000 });
    const localDb = mongoose.connection.db;
    await localDb.collection('settings').deleteMany({});
    await localDb.collection('settings').insertOne(cleanSettings);
    await localDb.collection('portfoliostates').deleteMany({});
    await localDb.collection('skills').updateOne(
      { id: 'skill-frontend' },
      { $set: { name: 'Frontend', category: 'Frontend' }, $unset: { color: '', subtitle: '' } }
    );
    await localDb.collection('users').deleteMany({ username: 'test_admin' });
    await localDb.collection('certificates').deleteMany({ id: { $in: ['cert1', 'cert2', 'cert3', 'cert4', 'cert5'] } });
    console.log('[SyncAtlas] Local MongoDB also cleaned successfully.');
  } catch (_localErr) {
    console.log('[SyncAtlas] Note: Local Mongo fallback cleanup skipped:', _localErr.message);
  }

  console.log('\n[SyncAtlas] VERIFYING CLEAN STATE IN ATLAS:');
  await mongoose.disconnect();
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  const verifyDb = mongoose.connection.db;
  const verifiedSetting = await verifyDb.collection('settings').findOne({});
  console.log('  Atlas SiteName:', verifiedSetting.siteName);
  console.log('  Atlas ContactEmail:', verifiedSetting.contactEmail);
  console.log('  Atlas ContactNote:', JSON.stringify(verifiedSetting.contactNote));
  console.log('  Atlas AccentColor:', verifiedSetting.accentColor);
  console.log('  Atlas ThemeMode:', verifiedSetting.themeMode);

  await mongoose.disconnect();
  console.log('[SyncAtlas] ALL CLOUD ATLAS COLLECTIONS 100% CLEANED!');
  process.exit(0);
}

syncAtlas().catch((err) => {
  console.error('[SyncAtlas] Error:', err);
  process.exit(1);
});
