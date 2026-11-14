const fs = require('fs');
const path = require('path');
const mongoose = require('../server/node_modules/mongoose');
const { getEnvConfig } = require('../server/src/config/env');

async function cleanMilestones() {
  const config = getEnvConfig();
  const portfolioPath = path.resolve(__dirname, '../server/data/portfolio.json');
  const p = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));

  p.profile.learningJourney = p.profile.learningJourney.filter(
    (m) => m.id !== 'li-1793592905629-1' && m.id !== 'li-1793592905629-2'
  );

  fs.writeFileSync(portfolioPath, JSON.stringify(p, null, 2) + '\n', 'utf8');
  console.log('[Clean] Cleaned portfolio.json, count:', p.profile.learningJourney.length);

  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;

  await db.collection('profiles').deleteMany({});
  await db.collection('profiles').insertOne(p.profile);

  await db.collection('portfoliostates').updateOne(
    { singletonKey: 'main_portfolio' },
    { $set: { profile: p.profile } },
    { upsert: true }
  );

  console.log('[Clean] Cleaned MongoDB Atlas profiles & portfoliostates!');
  await mongoose.disconnect();
}

cleanMilestones().catch((err) => {
  console.error('[Clean] Error:', err);
  process.exit(1);
});
