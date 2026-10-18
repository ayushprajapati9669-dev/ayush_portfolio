/**
 * Mongoose Schema Definitions for Ayush Prajapati Portfolio (Argon)
 * Used when Mongoose is installed and connected to a live MongoDB instance,
 * and mirrored by server/src/repositories/portfolioRepository.js for deterministic schema enforcement.
 */
const mongooseSchemas = {
  UserSchema: {
    username: { type: 'String', required: true, unique: true, trim: true },
    passwordHash: { type: 'String', required: true },
    role: { type: 'String', enum: ['admin'], default: 'admin' },
    lastLoginAt: { type: 'Date', default: null },
    createdAt: { type: 'Date' },
    updatedAt: { type: 'Date' }
  },
  ProfileSchema: {
    name: { type: 'String', required: true },
    displayName: { type: 'String', required: true },
    monogram: { type: 'String', required: true },
    eyebrow: { type: 'String', required: true },
    headline: { type: 'String', required: true },
    supportingHeadline: { type: 'String', required: true },
    heroDescription: { type: 'String', required: true },
    availabilityLabel: { type: 'String', required: true },
    primaryCtaText: { type: 'String', required: true },
    secondaryCtaText: { type: 'String', required: true },
    education: {
      degree: { type: 'String', required: true },
      college: { type: 'String', required: true },
      location: { type: 'String', required: true },
      stage: { type: 'String', required: true }
    },
    aboutBio: { type: 'Array' },
    focusAreas: { type: 'Array' },
    learningJourney: { type: 'Array' },
    socialLinks: {
      github: { type: 'String' },
      linkedin: { type: 'String' },
      instagram: { type: 'String' }
    },
    portrait: {
      url: { type: 'String' },
      alt: { type: 'String' },
      caption: { type: 'String' },
      isTemporaryStandIn: { type: 'Boolean', default: false },
      scale: { type: 'Number', default: 1.0 },
      offsetX: { type: 'Number', default: 0 },
      offsetY: { type: 'Number', default: 0 },
      particleDensity: { type: 'Number', default: 4 }
    },
    updatedAt: { type: 'Date' }
  },
  ProjectSchema: {
    id: { type: 'String', required: true, unique: true },
    title: { type: 'String', required: true },
    slug: { type: 'String', required: true, unique: true },
    category: { type: 'String', required: true },
    shortDescription: { type: 'String', required: true },
    problemContext: { type: 'String', required: true },
    approachArchitecture: { type: 'String', required: true },
    implementedFeatures: { type: 'Array', required: true },
    lessonsLearned: { type: 'String', required: true },
    disclaimer: { type: 'String', default: '' },
    technologies: { type: 'Array', required: true },
    thumbnailType: { type: 'String', default: 'image' },
    thumbnailUrl: { type: 'String', default: '' },
    galleryImages: { type: 'Array', default: [] },
    githubUrl: { type: 'String', default: '' },
    liveDemoUrl: { type: 'String', default: '' },
    featured: { type: 'Boolean', default: false },
    status: { type: 'String', enum: ['draft', 'published'], default: 'draft' },
    displayOrder: { type: 'Number', default: 0 },
    createdAt: { type: 'Date' },
    updatedAt: { type: 'Date' }
  },
  CertificateSchema: {
    id: { type: 'String', required: true, unique: true },
    title: { type: 'String', required: true },
    issuer: { type: 'String', required: true },
    issueDate: { type: 'String', required: true },
    credentialId: { type: 'String', default: '' },
    credentialUrl: { type: 'String', default: '' },
    skillsCovered: { type: 'String', default: '' },
    imageUrl: { type: 'String', required: true },
    updatedAt: { type: 'Date' }
  },
  SkillCategorySchema: {
    id: { type: 'String', required: true, unique: true },
    category: { type: 'String', required: true },
    description: { type: 'String', default: '' },
    displayOrder: { type: 'Number', default: 0 },
    items: { type: 'Array', required: true },
    updatedAt: { type: 'Date' }
  },
  MessageSchema: {
    id: { type: 'String', required: true, unique: true },
    name: { type: 'String', required: true },
    email: { type: 'String', required: true },
    subject: { type: 'String', required: true },
    message: { type: 'String', required: true },
    status: { type: 'String', enum: ['unread', 'read'], default: 'unread' },
    createdAt: { type: 'Date' },
    updatedAt: { type: 'Date' }
  },
  SettingSchema: {
    siteTitle: { type: 'String', required: true },
    seoDescription: { type: 'String', required: true },
    particlesEnabled: { type: 'Boolean', default: true },
    contactNote: { type: 'String', default: '' },
    updatedAt: { type: 'Date' }
  }
};

module.exports = { mongooseSchemas };
