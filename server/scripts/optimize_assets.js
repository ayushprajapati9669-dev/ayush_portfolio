const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

function saveBase64ToFile(base64Str, prefix) {
  if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image/')) {
    return base64Str;
  }
  const match = base64Str.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!match) return base64Str;
  
  let ext = match[1].toLowerCase();
  if (ext === 'jpeg') ext = 'jpg';
  const buffer = Buffer.from(match[2], 'base64');
  const filename = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Saved image to ${filename} (size: ${buffer.length} bytes)`);
  return `/uploads/${filename}`;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const Profile = mongoose.models.Profile || mongoose.model('Profile', new mongoose.Schema({}, { strict: false }), 'profiles');
  const PortfolioState = mongoose.models.PortfolioState || mongoose.model('PortfolioState', new mongoose.Schema({}, { strict: false }), 'portfolio_states');

  const profileDoc = await Profile.findOne({});
  if (profileDoc) {
    let modified = false;
    if (profileDoc.portrait && profileDoc.portrait.url && profileDoc.portrait.url.startsWith('data:image/')) {
      profileDoc.portrait.url = saveBase64ToFile(profileDoc.portrait.url, 'portrait');
      profileDoc.markModified('portrait');
      modified = true;
    }
    if (Array.isArray(profileDoc.learningJourney)) {
      profileDoc.learningJourney.forEach((item, idx) => {
        if (item.image && typeof item.image === 'string' && item.image.startsWith('data:image/')) {
          item.image = saveBase64ToFile(item.image, `journey_${idx}`);
          modified = true;
        }
        if (Array.isArray(item.images)) {
          item.images = item.images.map((img, imgIdx) => {
            if (typeof img === 'string' && img.startsWith('data:image/')) {
              modified = true;
              return saveBase64ToFile(img, `journey_${idx}_${imgIdx}`);
            }
            return img;
          });
        }
      });
      if (modified) profileDoc.markModified('learningJourney');
    }
    if (modified) {
      await profileDoc.save();
      console.log('Saved optimized Profile document to MongoDB!');
    }
  }

  const stateDoc = await PortfolioState.findOne({ singletonKey: 'main_portfolio' });
  if (stateDoc && stateDoc.profile) {
    let modified = false;
    if (stateDoc.profile.portrait && stateDoc.profile.portrait.url && stateDoc.profile.portrait.url.startsWith('data:image/')) {
      stateDoc.profile.portrait.url = saveBase64ToFile(stateDoc.profile.portrait.url, 'portrait_state');
      stateDoc.markModified('profile.portrait');
      modified = true;
    }
    if (Array.isArray(stateDoc.profile.learningJourney)) {
      stateDoc.profile.learningJourney.forEach((item, idx) => {
        if (item.image && typeof item.image === 'string' && item.image.startsWith('data:image/')) {
          item.image = saveBase64ToFile(item.image, `state_journey_${idx}`);
          modified = true;
        }
        if (Array.isArray(item.images)) {
          item.images = item.images.map((img, imgIdx) => {
            if (typeof img === 'string' && img.startsWith('data:image/')) {
              modified = true;
              return saveBase64ToFile(img, `state_journey_${idx}_${imgIdx}`);
            }
            return img;
          });
        }
      });
      if (modified) stateDoc.markModified('profile.learningJourney');
    }
    if (modified) {
      await stateDoc.save();
      console.log('Saved optimized PortfolioState document to MongoDB!');
    }
  }

  const localPortfolioPath = path.resolve(__dirname, '../data/portfolio.json');
  if (fs.existsSync(localPortfolioPath)) {
    try {
      const localData = JSON.parse(fs.readFileSync(localPortfolioPath, 'utf8'));
      let modified = false;
      if (localData.profile && localData.profile.portrait && localData.profile.portrait.url && localData.profile.portrait.url.startsWith('data:image/')) {
        localData.profile.portrait.url = saveBase64ToFile(localData.profile.portrait.url, 'local_portrait');
        modified = true;
      }
      if (Array.isArray(localData.profile && localData.profile.learningJourney)) {
        localData.profile.learningJourney.forEach((item, idx) => {
          if (item.image && typeof item.image === 'string' && item.image.startsWith('data:image/')) {
            item.image = saveBase64ToFile(item.image, `local_journey_${idx}`);
            modified = true;
          }
          if (Array.isArray(item.images)) {
            item.images = item.images.map((img, imgIdx) => {
              if (typeof img === 'string' && img.startsWith('data:image/')) {
                modified = true;
                return saveBase64ToFile(img, `local_journey_${idx}_${imgIdx}`);
              }
              return img;
            });
          }
        });
      }
      if (modified) {
        fs.writeFileSync(localPortfolioPath, JSON.stringify(localData, null, 2));
        console.log('Updated server/data/portfolio.json!');
      }
    } catch (e) {
      console.error('Local JSON update error:', e.message);
    }
  }

  await mongoose.disconnect();
  console.log('Asset optimization completed successfully!');
}

run().catch(console.error);

