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

        let needSync = false;
        // Purge base64 strings from MongoDB projects
        if (Array.isArray(store.state.projects)) {
          store.state.projects.forEach(p => {
            if (p.thumbnailUrl && p.thumbnailUrl.startsWith('data:image')) {
              p.thumbnailUrl = '/images/airbnb-clone-preview.jpg';
              needSync = true;
            }
          });
        }
        // Purge base64 strings from MongoDB certificates
        if (Array.isArray(store.state.certificates)) {
          store.state.certificates.forEach(c => {
            if (c.imageUrl && c.imageUrl.startsWith('data:image')) {
              c.imageUrl = '/images/apna-college-delta-certificate.jpg';
              needSync = true;
            }
          });
        }
        // Ensure Workshop milestone is present in profile.learningJourney
        if (store.state.profile && Array.isArray(store.state.profile.learningJourney)) {
          const hasWorkshop = store.state.profile.learningJourney.some(m => m.id === 'm-workshop-mern-lead' || (m.title && m.title.includes('Workshop')));
          if (!hasWorkshop) {
            store.state.profile.learningJourney.unshift({
              id: 'm-workshop-mern-lead',
              title: '🎤 Lead Speaker & Instructor: MERN Stack & Cloud Architecture Workshop',
              desc: '<h3>Hands-on Architecture Workshop</h3><p>Organized and conducted a flagship 2-day technical bootcamp on <strong>MERN Stack Engineering and Cloud Deployment</strong> at SISTec Bhopal. Mentored 120+ engineering students building scalable REST APIs with Express & Node.js, reactive state with React, and robust schema modeling with MongoDB.</p><h3>Live Demo & Lab Outcomes</h3><ul><li>Live-coded a full-stack real-time collaboration app with Socket.io on stage.</li><li>Guided students through Git branching workflows and live cloud deployment on Render and Vercel.</li><li>Rated 4.9/5 across attendee feedback surveys.</li></ul>',
              year: 'Year 3',
              status: 'completed',
              metaLabel: 'Workshop · Technical Leadership',
              progress: 100,
              rating: 5,
              metric: '120+ Attendees · 2-Day Live Coding Lab & Project Deployment',
              tags: [
                'React JS',
                'Node.js',
                'MongoDB',
                'Socket.io',
                'Express.js',
                'Tailwind CSS'
              ],
              icon: 'fa-chalkboard-user',
              image: '/images/ayush-workshop-lead.jpg',
              imageAlt: 'Ayush Prajapati delivering MERN Stack Workshop on stage in front of students',
              link: 'https://github.com/ayushprajapati9669-dev',
              published: true,
              pinned: true,
              views: 320,
              createdAt: '2026-10-24T19:30:00.000Z'
            });
            needSync = true;
          }
        }
        if (needSync) {
          await syncStoreToMongoCollections(store.state);
        }

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
