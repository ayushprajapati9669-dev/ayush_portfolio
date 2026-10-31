const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  issuer: { type: String, default: '' },
  issueDate: { type: String, default: '2025' },
  credentialId: { type: String, default: '' },
  credentialUrl: { type: String, default: '' },
  skillsCovered: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false }
}, { timestamps: true, strict: false });

module.exports = mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema, 'certificates');

