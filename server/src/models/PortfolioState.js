let mongoose = null;
try {
  mongoose = require('mongoose');
} catch (_err) {
  mongoose = null;
}

if (mongoose) {
  const ProjectSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    slug: String,
    category: { type: String, required: true },
    shortDescription: { type: String, required: true },
    technologies: [String],
    thumbnailUrl: { type: String, required: true },
    githubUrl: { type: String, required: true },
    liveDemoUrl: { type: String, required: true },
    featured: { type: Boolean, default: true },
    status: { type: String, default: 'published' },
    displayOrder: { type: Number, default: 1 }
  }, { timestamps: true });

  const CertificateSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String, required: true },
    credentialId: String,
    credentialUrl: String,
    skillsCovered: String,
    imageUrl: { type: String, required: true }
  }, { timestamps: true });

  const PortfolioStateSchema = new mongoose.Schema({
    singletonKey: { type: String, default: 'main_portfolio', unique: true },
    profile: { type: mongoose.Schema.Types.Mixed, required: true },
    projects: [ProjectSchema],
    skills: [mongoose.Schema.Types.Mixed],
    certificates: [CertificateSchema],
    messages: [mongoose.Schema.Types.Mixed],
    settings: mongoose.Schema.Types.Mixed,
    adminConfig: {
      username: { type: String, default: 'ayushprajapati9669@gmail.com' },
      passwordHash: { type: String, default: '' },
      recoveryEmail: { type: String, default: 'ayushprajapati9669@gmail.com' },
      recoveryPhone: { type: String, default: '9669802554' }
    }
  }, { timestamps: true });

  module.exports = mongoose.models.PortfolioState || mongoose.model('PortfolioState', PortfolioStateSchema);
} else {
  module.exports = null;
}
