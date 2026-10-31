const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, default: 'Ayush Prajapati - Official Resume' },
  fileName: { type: String, default: 'Ayush_Prajapati_Resume.pdf' },
  fileUrl: { type: String, required: true },
  fileType: { type: String, default: 'application/pdf' },
  sizeBytes: { type: Number, default: 0 },
  uploadedAt: { type: String, default: () => new Date().toISOString() },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

module.exports = mongoose.models.Resume || mongoose.model('Resume', ResumeSchema, 'resumes');

