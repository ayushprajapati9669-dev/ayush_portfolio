const {
  Project,
  Certificate,
  SkillCategory,
  Message,
  Profile,
  Setting,
  Resume,
  User,
  Analytics,
  PortfolioState
} = require('../models');

let mongoose = null;
try {
  mongoose = require('mongoose');
} catch (_err) {
  mongoose = null;
}

async function bulkSyncCollection(Model, items, idKey = 'id') {
  if (!Model || !Array.isArray(items)) return;
  if (items.length > 0) {
    const ops = items.map(item => {
      const copy = { ...item };
      delete copy._id;
      delete copy.__v;
      return {
        updateOne: {
          filter: { [idKey]: item[idKey] },
          update: { $set: copy },
          upsert: true
        }
      };
    });
    await Model.bulkWrite(ops, { ordered: false });
  }
  const currentIds = items.map(i => i[idKey]).filter(Boolean);
  await Model.deleteMany({ [idKey]: { $nin: currentIds } });
}

/**
 * Persist store state changes to MongoDB Atlas collections.
 * High-performance atomic bulk writes directly to MongoDB database.
 */
async function syncStoreToMongoCollections(state) {
  if (!mongoose || mongoose.connection.readyState !== 1) return;

  try {
    // 1-4. Bulk write relational collections in parallel
    await Promise.all([
      bulkSyncCollection(Project, state.projects),
      bulkSyncCollection(Certificate, state.certificates),
      bulkSyncCollection(SkillCategory, state.skills),
      bulkSyncCollection(Message, state.messages),
      bulkSyncCollection(Resume, state.resumes)
    ]);

    // 5. Admin Users collection
    if (Array.isArray(state.users) && state.users.length > 0) {
      const userOps = state.users.map(u => {
        const copy = { ...u };
        delete copy._id;
        delete copy.__v;
        return {
          updateOne: {
            filter: { username: u.username },
            update: { $set: copy },
            upsert: true
          }
        };
      });
      await User.bulkWrite(userOps, { ordered: false });
    }

    // 6. Profiles singleton
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

    // 7. Settings singleton (includes theme, trash, mediaLibrary, templates, logs)
    if (state.settings) {
      const copy = { ...state.settings };
      delete copy._id;
      delete copy.__v;
      await Setting.findOneAndUpdate(
        {},
        { $set: copy },
        { upsert: true, new: true }
      );
    }

    // 9. Legacy singleton update (for backward compatibility)
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
 * Loads existing live data FROM database collections into the store.
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
      serverSelectionTimeoutMS: 8000
    });

    console.log('[Argon Portfolio Server] [MongoDB] Successfully connected to database.');
    if (store) {
      store.mode = 'mongodb-connected';

      try {
        // Load live collections from MongoDB
        const existingProjects = await Project.find({}).lean();
        if (existingProjects && existingProjects.length > 0) {
          store.state.projects = existingProjects.map(p => {
            const copy = { ...p };
            delete copy._id;
            delete copy.__v;
            return copy;
          });
        }

        const existingCerts = await Certificate.find({}).lean();
        if (existingCerts && existingCerts.length > 0) {
          store.state.certificates = existingCerts.map(c => {
            const copy = { ...c };
            delete copy._id;
            delete copy.__v;
            return copy;
          });
        }

        const existingMessages = await Message.find({}).lean();
        if (existingMessages && existingMessages.length > 0) {
          store.state.messages = existingMessages.map(m => {
            const copy = { ...m };
            delete copy._id;
            delete copy.__v;
            return copy;
          });
        }

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
        if (existingResumes && existingResumes.length > 0) {
          store.state.resumes = existingResumes.map(r => {
            const copy = { ...r };
            delete copy._id;
            delete copy.__v;
            return copy;
          });
        }

        const existingSettings = await Setting.findOne({}).lean();
        if (existingSettings) {
          const copy = { ...existingSettings };
          delete copy._id;
          delete copy.__v;
          store.state.settings = { ...(store.state.settings || {}), ...copy };
        }

        const existingUsers = await User.find({}).lean();
        if (existingUsers && existingUsers.length > 0) {
          store.state.users = existingUsers.map(u => {
            const copy = { ...u };
            delete copy._id;
            delete copy.__v;
            return copy;
          });
        }

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
        // Ensure legacy stand-in ceiling image is replaced with clean transparent hero cutout
        const isLegacyCeiling = (u) => !u || (typeof u === 'string' && (u.startsWith('data:image/webp;base64,UklGRt5SAABXRUJQV') || u === '/images/ayush-portrait-new.jpg' || u === '/images/ayush-portrait-new.webp' || u === '/images/ayush-hero-portrait.png'));
        if (store.state.profile) {
          if (store.state.profile.photoUrl && isLegacyCeiling(store.state.profile.photoUrl)) {
            store.state.profile.photoUrl = '/uploads/hero_cutout_1794562459704_847.webp';
            needSync = true;
          }
          if (store.state.profile.portrait && isLegacyCeiling(store.state.profile.portrait.url)) {
            store.state.profile.portrait.url = '/uploads/hero_cutout_1794562459704_847.webp';
            store.state.profile.portrait.isTemporaryStandIn = false;
            needSync = true;
          }
          if (typeof store.state.profile.resumeUrl === 'string' && store.state.profile.resumeUrl.startsWith('data:application/pdf')) {
            store.state.profile.resumeUrl = '/images/Ayush_Prajapati_Resume.pdf';
            needSync = true;
          }
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

        // Register persistence hook: Writes to MongoDB whenever user creates/updates/deletes
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
