const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  key: { type: String, default: 'main_analytics', unique: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true, strict: false });

module.exports = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema, 'analytics');

