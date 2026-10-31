const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  name: { type: String, default: 'Ayush Prajapati' },
  displayName: { type: String, default: 'Ayush Prajapati' },
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
}, { timestamps: true, strict: false });

module.exports = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema, 'profiles');

