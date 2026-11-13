const path = require('path');
const { getEnvConfig } = require('../src/config/env');
const { connectMongoDB } = require('../src/config/db');
const { Project } = require('../src/models');
const mongoose = require('mongoose');
const fs = require('fs');

async function updateDB() {
  const config = getEnvConfig();
  console.log('Connecting to Mongo with URI from config...');
  const conn = await connectMongoDB(config.mongoUri);
  if (conn) {
    const res1 = await Project.updateOne({ slug: 'ai-chat-boat' }, { $set: { thumbnailUrl: '/images/ai-chat-preview.webp' } });
    console.log('Updated ai-chat-boat in MongoDB:', res1);
    const res2 = await Project.updateOne({ slug: 'ai-agentic-workspace' }, { $set: { thumbnailUrl: '/images/ai-agentic-preview.webp' } });
    console.log('Updated ai-agentic-workspace in MongoDB:', res2);
    await mongoose.disconnect();
  }

  // Also update portfolio.json
  const pf = JSON.parse(fs.readFileSync(path.join(config.dataDir, 'portfolio.json'), 'utf8'));
  for (const p of pf.projects) {
    if (p.slug === 'ai-chat-boat') p.thumbnailUrl = '/images/ai-chat-preview.webp';
    if (p.slug === 'ai-agentic-workspace') p.thumbnailUrl = '/images/ai-agentic-preview.webp';
  }
  fs.writeFileSync(path.join(config.dataDir, 'portfolio.json'), JSON.stringify(pf, null, 2));
  console.log('Updated portfolio.json locally as well!');
}

updateDB().catch(console.error);

