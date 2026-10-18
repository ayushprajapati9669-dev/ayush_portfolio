const {
  Project,
  Certificate,
  SkillCategory,
  Message,
  Profile,
  Setting,
  Resume
} = require('../models/mongoModels');
const PortfolioState = require('../models/PortfolioState');

let mongoose = null;
try {
  mongoose = require('mongoose');
} catch (_err) {
  mongoose = null;
}

/**
 * Persist store state changes to MongoDB Atlas collections.
 * Only called when actual user mutations (create/update/delete) occur.
 */
async function syncStoreToMongoCollections(state) {
  if (!mongoose || mongoose.connection.readyState !== 1) return;

  try {
    // 1. Projects collection
    if (Array.isArray(state.projects)) {
      for (const p of state.projects) {
        const copy = { ...p };
        delete copy._id;
        delete copy.__v;
        await Project.findOneAndUpdate(
          { id: p.id },
          { $set: copy },
          { upsert: true, new: true }
        );
      }
      const storeIds = state.projects.map(p => p.id);
      await Project.deleteMany({ id: { $nin: storeIds } });
    }

    // 2. Certificates collection
    if (Array.isArray(state.certificates)) {
      for (const c of state.certificates) {
        const copy = { ...c };
        delete copy._id;
        delete copy.__v;
        await Certificate.findOneAndUpdate(
          { id: c.id },
          { $set: copy },
          { upsert: true, new: true }
        );
      }
      const certIds = state.certificates.map(c => c.id);
      await Certificate.deleteMany({ id: { $nin: certIds } });
    }

    // 3. Skills collection
    if (Array.isArray(state.skills) && state.skills.length > 0) {
      for (const s of state.skills) {
        const copy = { ...s };
        delete copy._id;
        delete copy.__v;
        await SkillCategory.findOneAndUpdate(
          { id: s.id },
          { $set: copy },
          { upsert: true, new: true }
        );
      }
      const skillIds = state.skills.map(s => s.id);
      await SkillCategory.deleteMany({ id: { $nin: skillIds } });
    }

    // 4. Messages collection
    if (Array.isArray(state.messages)) {
      for (const m of state.messages) {
        const copy = { ...m };
        delete copy._id;
        delete copy.__v;
        await Message.findOneAndUpdate(
          { id: m.id },
          { $set: copy },
          { upsert: true, new: true }
        );
      }
      const msgIds = state.messages.map(m => m.id);
      await Message.deleteMany({ id: { $nin: msgIds } });
    }

    // 5. Profiles collection
    if (state.profile) {
      const copy = { ...state.profile };
      delete copy._id;
      delete copy.__v;
      await Profile.findOneAndUpdate(
        {},
        { $set: copy },
        { upsert: true, new: true }
      );
    }

    // 6. Settings collection
    if (state.settings) {
      await Setting.findOneAndUpdate(
        {},
        { $set: state.settings },
        { upsert: true, new: true }
      );
    }

    // 7. Resumes collection
    if (Array.isArray(state.resumes)) {
      for (const r of state.resumes) {
        const copy = { ...r };
        delete copy._id;
        delete copy.__v;
        await Resume.findOneAndUpdate(
          { id: r.id },
          { $set: copy },
          { upsert: true, new: true }
        );
      }
      const resumeIds = state.resumes.map(r => r.id);
      await Resume.deleteMany({ id: { $nin: resumeIds } });
    }

    // Legacy singleton update
    if (PortfolioState) {
      await PortfolioState.findOneAndUpdate(
        { singletonKey: 'main_portfolio' },
        {
          $set: {
            profile: state.profile,
            projects: state.projects || [],
            skills: state.skills || [],
            certificates: state.certificates || [],
            resumes: state.resumes || [],
            messages: state.messages || [],
            settings: state.settings || {},
            adminConfig: {
              username: state.users?.[0]?.username || 'ayushprajapati9669@gmail.com',
              passwordHash: state.users?.[0]?.passwordHash || ''
            }
          }
        },
        { upsert: true }
      );
    }
  } catch (err) {
    console.warn('[Argon Portfolio Server] [MongoDB Sync Warning]:', err.message);
  }
}

/**
 * Connect to MongoDB Atlas.
 * Loads existing data FROM database collections into the store.
 * NEVER pushes demo/dummy projects or certificates on startup.
 */
async function connectMongoDB(mongoUri, store) {
  if (!mongoose) {
    console.log('[Argon Portfolio Server] Mongoose is not available. Using local JSON store.');
    return null;
  }

  const uri = mongoUri || process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Argon Portfolio Server] No MONGODB_URI configured. Using local JSON store.');
    return null;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000
    });

    console.log('[Argon Portfolio Server] [MongoDB] Successfully connected to database.');
    if (store) {
      store.mode = 'mongodb-connected';

      try {
        // Load ONLY what is in MongoDB collections
        const existingProjects = await Project.find({}).lean();
        store.state.projects = (existingProjects || []).map(p => {
          const copy = { ...p };
          delete copy._id;
          delete copy.__v;
          return copy;
        });

        const existingCerts = await Certificate.find({}).lean();
        store.state.certificates = (existingCerts || []).map(c => {
          const copy = { ...c };
          delete copy._id;
          delete copy.__v;
          return copy;
        });

        const existingMessages = await Message.find({}).lean();
        store.state.messages = (existingMessages || []).map(m => {
          const copy = { ...m };
          delete copy._id;
          delete copy.__v;
          return copy;
        });

        const existingProfile = await Profile.findOne({}).lean();
        if (existingProfile) {
          const copy = { ...existingProfile };
          delete copy._id;
          delete copy.__v;
          store.state.profile = copy;
        }

        const existingSkills = await SkillCategory.find({}).lean();
        if (existingSkills && existingSkills.length > 0) {
          store.state.skills = existingSkills.map(s => {
            const copy = { ...s };
            delete copy._id;
            delete copy.__v;
            return copy;
          });
        }

        const existingResumes = await Resume.find({}).lean();
        store.state.resumes = (existingResumes || []).map(r => {
          const copy = { ...r };
          delete copy._id;
          delete copy.__v;
          return copy;
        });

        // Save loaded state locally
        store._persist();

        // Register persistence hook: ONLY writes to MongoDB when user creates/updates/deletes
        store.onPersistMongo = async (state) => {
          await syncStoreToMongoCollections(state);
        };
      } catch (syncErr) {
        console.warn('[Argon Portfolio Server] [MongoDB] Initial load warning:', syncErr.message);
      }
    }

    return mongoose.connection;
  } catch (err) {
    console.warn(`[Argon Portfolio Server] [MongoDB] Connection warning (${err.message}). Falling back to local JSON document store.`);
    if (store) {
      store.mode = 'json-document-store';
    }
    return null;
  }
}

module.exports = {
  connectMongoDB,
  syncStoreToMongoCollections
};
