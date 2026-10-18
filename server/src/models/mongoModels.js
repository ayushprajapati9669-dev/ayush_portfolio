const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true },
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
}, { timestamps: true });

const CertificateSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  issuer: { type: String, default: '' },
  issueDate: { type: String, default: '2025' },
  credentialId: { type: String, default: '' },
  credentialUrl: { type: String, default: '' },
  skillsCovered: { type: String, default: '' },
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

const SkillCategorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  displayOrder: { type: Number, default: 0 },
  items: { type: Array, default: [] }
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'unread' }
}, { timestamps: true });

const ProfileSchema = new mongoose.Schema({
  name: { type: String, default: 'Ayush Prajapati' },
  displayName: { type: String, default: 'AYUSH PRAJAPATI' },
  monogram: { type: String, default: 'AP' },
  eyebrow: { type: String, default: '' },
  headline: { type: String, default: '' },
  supportingHeadline: { type: String, default: '' },
  heroDescription: { type: String, default: '' },
  availabilityLabel: { type: String, default: '' },
  primaryCtaText: { type: String, default: 'Explore my work' },
  secondaryCtaText: { type: String, default: "Let's connect" },
  education: { type: mongoose.Schema.Types.Mixed },
  aboutBio: { type: [String], default: [] },
  focusAreas: { type: Array, default: [] },
  learningJourney: { type: Array, default: [] },
  socialLinks: { type: mongoose.Schema.Types.Mixed },
  portrait: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const SettingSchema = new mongoose.Schema({
  siteTitle: { type: String, default: 'Ayush Prajapati — Developer Portfolio' },
  seoDescription: { type: String, default: '' },
  particlesEnabled: { type: Boolean, default: true },
  contactNote: { type: String, default: '' }
}, { timestamps: true });

const ResumeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, default: 'Ayush Prajapati - Official Resume' },
  fileName: { type: String, default: 'Ayush_Prajapati_Resume.pdf' },
  fileUrl: { type: String, required: true },
  fileType: { type: String, default: 'application/pdf' },
  sizeBytes: { type: Number, default: 0 },
  uploadedAt: { type: String, default: () => new Date().toISOString() },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema, 'projects');
const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema, 'certificates');
const SkillCategory = mongoose.models.SkillCategory || mongoose.model('SkillCategory', SkillCategorySchema, 'skills');
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema, 'messages');
const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema, 'profiles');
const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema, 'settings');
const Resume = mongoose.models.Resume || mongoose.model('Resume', ResumeSchema, 'resumes');

module.exports = {
  Project,
  Certificate,
  SkillCategory,
  Message,
  Profile,
  Setting,
  Resume
};
