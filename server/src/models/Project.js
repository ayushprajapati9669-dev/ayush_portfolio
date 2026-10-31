const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, default: '' },
  category: { type: String, default: 'Full-Stack Web App' },
  shortDescription: { type: String, default: '' },
  problemContext: { type: String, default: '' },
  approachArchitecture: { type: String, default: '' },
  implementedFeatures: { type: [String], default: [] },
  lessonsLearned: { type: String, default: '' },
  disclaimer: { type: String, default: '' },
  technologies: { type: [String], default: [] },
  thumbnailType: { type: String, default: 'image' },
  thumbnailUrl: { type: String, default: '' },
  galleryImages: { type: [String], default: [] },
  githubUrl: { type: String, default: '' },
  liveDemoUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  status: { type: String, default: 'published' },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true, strict: false });

module.exports = mongoose.models.Project || mongoose.model('Project', ProjectSchema, 'projects');

