const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  siteTitle: { type: String, default: 'Ayush Prajapati — Developer Portfolio' },
  seoDescription: { type: String, default: '' },
  particlesEnabled: { type: Boolean, default: true },
  contactNote: { type: String, default: '' },
  theme: { type: String, default: 'theme-midnight' },
  accent: { type: String, default: 'accent-cyan' },
  density: { type: String, default: 'comfortable' },
  mediaLibrary: { type: Array, default: [] },
  adminTrash: { type: Array, default: [] },
  adminTemplates: { type: Array, default: [] },
  adminLogs: { type: Array, default: [] }
}, { timestamps: true, strict: false });

module.exports = mongoose.models.Setting || mongoose.model('Setting', SettingSchema, 'settings');

