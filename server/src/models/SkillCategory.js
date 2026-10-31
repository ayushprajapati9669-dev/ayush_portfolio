const mongoose = require('mongoose');

const SkillCategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  displayOrder: { type: Number, default: 0 },
  items: { type: Array, default: [] }
}, { timestamps: true, strict: false });

module.exports = mongoose.models.SkillCategory || mongoose.model('SkillCategory', SkillCategorySchema, 'skills');

