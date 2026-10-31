const { readJsonBody, sendJson } = require('../utils/httpUtils');
const {
  sanitizeText,
  isValidUrlOrEmpty,
  validateProjectInput,
  validateMediaUpload
} = require('../validators/portfolioValidators');
const { persistMediaUpload } = require('../services/mediaService');
const analyticsService = require('../services/analyticsService');
const { generateCaseStudyDraft } = require('../services/aiAssistantService');

function createAdminController({ store, config }) {
  return {
    getSummary(req, res) {
      return sendJson(res, 200, { summary: store.getAdminSummary() });
    },

    getAnalytics(req, res) {
      return sendJson(res, 200, { analytics: analyticsService.getDashboardData() });
    },

    async generateAiCaseStudy(req, res) {
      const body = await readJsonBody(req);
      const draft = generateCaseStudyDraft(body || {});
      return sendJson(res, 200, { success: true, draft });
    },

    async updateProfile(req, res) {
      const body = await readJsonBody(req);
      const patch = {};
      if (body.name !== undefined) patch.name = sanitizeText(body.name, 120);
      if (body.displayName !== undefined) patch.displayName = sanitizeText(body.displayName, 120);
      if (body.monogram !== undefined) patch.monogram = sanitizeText(body.monogram, 10);
      if (body.headerSubtitle !== undefined) patch.headerSubtitle = sanitizeText(body.headerSubtitle, 160);
      if (body.email !== undefined) patch.email = sanitizeText(body.email, 160);
      if (body.phone !== undefined) patch.phone = sanitizeText(body.phone, 60);
      if (body.eyebrow !== undefined) patch.eyebrow = sanitizeText(body.eyebrow, 160);
      if (body.headline !== undefined) patch.headline = sanitizeText(body.headline, 160);
      if (body.supportingHeadline !== undefined) patch.supportingHeadline = sanitizeText(body.supportingHeadline, 200);
      if (body.heroDescription !== undefined) patch.heroDescription = sanitizeText(body.heroDescription, 600);
      if (body.availabilityLabel !== undefined) patch.availabilityLabel = sanitizeText(body.availabilityLabel, 140);
      if (body.primaryCtaText !== undefined) patch.primaryCtaText = sanitizeText(body.primaryCtaText, 60);
      if (body.secondaryCtaText !== undefined) patch.secondaryCtaText = sanitizeText(body.secondaryCtaText, 60);
      if (body.location !== undefined) patch.location = sanitizeText(body.location, 160);
      if (body.footerTagline !== undefined) patch.footerTagline = sanitizeText(body.footerTagline, 200);
      if (body.education && typeof body.education === 'object') {
        patch.education = {
          degree: sanitizeText(body.education.degree, 160),
          college: sanitizeText(body.education.college, 160),
          location: sanitizeText(body.education.location, 160),
          stage: sanitizeText(body.education.stage, 160),
          cgpa: sanitizeText(body.education.cgpa, 100),
          schoolBoard: sanitizeText(body.education.schoolBoard, 160),
          schoolXII: sanitizeText(body.education.schoolXII, 200),
          schoolScore: sanitizeText(body.education.schoolScore, 100)
        };
      }
      if (Array.isArray(body.aboutBio)) {
        patch.aboutBio = body.aboutBio.map(p => sanitizeText(String(p), 1000)).filter(Boolean);
      }
      if (Array.isArray(body.learningJourney)) {
        patch.learningJourney = body.learningJourney.map(item => ({
          phase: sanitizeText(item.phase || '', 120),
          title: sanitizeText(item.title || '', 200),
          description: sanitizeText(item.description || '', 1000)
        })).filter(item => item.title || item.description);
      }
      if (body.socialLinks && typeof body.socialLinks === 'object') {
        for (const k of ['github', 'linkedin', 'instagram']) {
          if (body.socialLinks[k] !== undefined && !isValidUrlOrEmpty(body.socialLinks[k])) {
            return sendJson(res, 400, { error: `Invalid social URL for ${k}` });
          }
        }
        patch.socialLinks = {
          github: sanitizeText(body.socialLinks.github || '', 300),
          linkedin: sanitizeText(body.socialLinks.linkedin || '', 300),
          instagram: sanitizeText(body.socialLinks.instagram || '', 300)
        };
      }
      if (body.portrait && typeof body.portrait === 'object') {
        patch.portrait = {
          ...store.getProfile().portrait,
          url: body.portrait.url !== undefined ? sanitizeText(body.portrait.url, 500) : store.getProfile().portrait.url,
          alt: body.portrait.alt !== undefined ? sanitizeText(body.portrait.alt, 300) : store.getProfile().portrait.alt,
          caption: body.portrait.caption !== undefined ? sanitizeText(body.portrait.caption, 200) : store.getProfile().portrait.caption,
          isTemporaryStandIn: body.portrait.isTemporaryStandIn !== undefined ? Boolean(body.portrait.isTemporaryStandIn) : store.getProfile().portrait.isTemporaryStandIn,
          scale: Number.isFinite(Number(body.portrait.scale)) ? Math.min(1.5, Math.max(0.6, Number(body.portrait.scale))) : 1.0,
          offsetX: Number.isFinite(Number(body.portrait.offsetX)) ? Math.min(120, Math.max(-120, Number(body.portrait.offsetX))) : 0,
          offsetY: Number.isFinite(Number(body.portrait.offsetY)) ? Math.min(120, Math.max(-120, Number(body.portrait.offsetY))) : 0,
          particleDensity: Number.isFinite(Number(body.portrait.particleDensity)) ? Math.min(8, Math.max(3, Number(body.portrait.particleDensity))) : 4
        };
      }
      const updated = store.updateProfile(patch);
      return sendJson(res, 200, { profile: updated });
    },

    listProjects(req, res) {
      return sendJson(res, 200, { projects: store.getAllProjectsAdmin() });
    },

    previewProject(req, res, pathname) {
      const idOrSlug = decodeURIComponent(pathname.replace('/api/admin/projects/preview/', ''));
      const proj = store.getProjectByIdOrSlugAdmin(idOrSlug);
      if (!proj) return sendJson(res, 404, { error: 'Project not found for preview.' });
      return sendJson(res, 200, { project: proj, previewMode: true });
    },

    async createProject(req, res) {
      const body = await readJsonBody(req);
      const validation = validateProjectInput(body, false);
      if (!validation.valid) {
        return sendJson(res, 400, { error: 'Project validation failed', details: validation.errors });
      }
      const created = store.createProject(validation.data);
      return sendJson(res, 201, { project: created });
    },

    async updateProject(req, res, pathname) {
      const id = decodeURIComponent(pathname.replace('/api/admin/projects/', ''));
      const body = await readJsonBody(req);
      const validation = validateProjectInput(body, true);
      if (!validation.valid) {
        return sendJson(res, 400, { error: 'Project validation failed', details: validation.errors });
      }
      const updated = store.updateProject(id, validation.data);
      if (!updated) return sendJson(res, 404, { error: 'Project not found.' });
      return sendJson(res, 200, { project: updated });
    },

    deleteProject(req, res, pathname) {
      const id = decodeURIComponent(pathname.replace('/api/admin/projects/', ''));
      const deleted = store.deleteProject(id);
      if (!deleted) return sendJson(res, 404, { error: 'Project not found.' });
      return sendJson(res, 200, { deleted: true, id });
    },

    listCertificates(req, res) {
      return sendJson(res, 200, { certificates: store.getCertificates() });
    },

    async upsertCertificate(req, res) {
      const body = await readJsonBody(req);
      const title = sanitizeText(body?.title, 180);
      const issuer = sanitizeText(body?.issuer, 180);
      if (!title || !issuer) {
        return sendJson(res, 400, { error: 'Certificate title and issuer are required.' });
      }
      const saved = store.upsertCertificate({
        id: body.id,
        title,
        issuer,
        issueDate: sanitizeText(body?.issueDate || '2025', 40),
        credentialId: sanitizeText(body?.credentialId || '', 120),
        credentialUrl: sanitizeText(body?.credentialUrl || '', 400),
        skillsCovered: sanitizeText(body?.skillsCovered || '', 400),
        imageUrl: sanitizeText(body?.imageUrl || '', 2000000)
      });
      return sendJson(res, 200, { certificate: saved, certificates: store.getCertificates() });
    },

    deleteCertificate(req, res, pathname) {
      const id = decodeURIComponent(pathname.replace('/api/admin/certificates/', ''));
      const ok = store.deleteCertificate(id);
      if (!ok) return sendJson(res, 404, { error: 'Certificate not found.' });
      return sendJson(res, 200, { deleted: true, id, certificates: store.getCertificates() });
    },

    listSkills(req, res) {
      return sendJson(res, 200, { skills: store.getSkills() });
    },

    async upsertSkillCategory(req, res) {
      const body = await readJsonBody(req);
      const category = sanitizeText(body?.category, 80);
      if (!category) return sendJson(res, 400, { error: 'Skill category name is required.' });
      const saved = store.upsertSkillCategory({
        id: body.id,
        category,
        description: sanitizeText(body?.description || '', 300),
        displayOrder: Number.isFinite(Number(body?.displayOrder)) ? Number(body.displayOrder) : undefined,
        items: Array.isArray(body?.items)
          ? body.items.map(item => ({
              name: sanitizeText(item.name, 80),
              logoKey: sanitizeText(item.logoKey || 'code', 40),
              note: sanitizeText(item.note || '', 240)
            })).filter(i => i.name)
          : []
      });
      return sendJson(res, 200, { skillCategory: saved, skills: store.getSkills() });
    },

    deleteSkillCategory(req, res, pathname) {
      const id = decodeURIComponent(pathname.replace('/api/admin/skills/', ''));
      const ok = store.deleteSkillCategory(id);
      if (!ok) return sendJson(res, 404, { error: 'Skill category not found.' });
      return sendJson(res, 200, { deleted: true, id, skills: store.getSkills() });
    },

    listMedia(req, res) {
      return sendJson(res, 200, { media: store.getMediaList() });
    },

    async uploadMedia(req, res) {
      const body = await readJsonBody(req);
      const check = validateMediaUpload(body);
      if (!check.valid) {
        return sendJson(res, 400, { error: 'Invalid media upload', details: check.errors });
      }
      const persisted = await persistMediaUpload(body, config);
      const record = store.addMediaRecord({
        filename: persisted.filename,
        originalName: sanitizeText(body.filename, 120),
        mimeType: body.mimeType,
        sizeBytes: persisted.sizeBytes,
        url: persisted.url,
        role: sanitizeText(body.role || 'general', 40),
        alt: sanitizeText(body.alt || 'Uploaded portfolio image', 240)
      });
      if (body.setAsHeroPortrait) {
        store.updateProfile({
          portrait: {
            ...store.getProfile().portrait,
            url: record.url,
            alt: record.alt,
            isTemporaryStandIn: Boolean(body.isTemporaryStandIn)
          }
        });
      }
      return sendJson(res, 201, { media: record, profile: store.getProfile() });
    },

    listMessages(req, res) {
      return sendJson(res, 200, { messages: store.getMessagesAdmin() });
    },

    async updateMessageStatus(req, res, pathname) {
      const id = decodeURIComponent(pathname.replace('/api/admin/messages/', ''));
      const body = await readJsonBody(req);
      const updated = store.updateMessageStatus(id, body?.status);
      if (!updated) return sendJson(res, 404, { error: 'Message not found.' });
      return sendJson(res, 200, { message: updated });
    },

    deleteMessage(req, res, pathname) {
      const id = decodeURIComponent(pathname.replace('/api/admin/messages/', ''));
      const ok = store.deleteMessage(id);
      if (!ok) return sendJson(res, 404, { error: 'Message not found.' });
      return sendJson(res, 200, { deleted: true, id });
    },

    getSettings(req, res) {
      return sendJson(res, 200, { settings: store.getSettings() });
    },

    async updateSettings(req, res) {
      const body = await readJsonBody(req);
      const updated = store.updateSettings({
        siteTitle: body.siteTitle !== undefined ? sanitizeText(body.siteTitle, 140) : store.getSettings().siteTitle,
        seoDescription: body.seoDescription !== undefined ? sanitizeText(body.seoDescription, 320) : store.getSettings().seoDescription,
        particlesEnabled: body.particlesEnabled !== undefined ? Boolean(body.particlesEnabled) : store.getSettings().particlesEnabled,
        contactNote: body.contactNote !== undefined ? sanitizeText(body.contactNote, 500) : store.getSettings().contactNote,
        cloudinaryCloudName: body.cloudinaryCloudName !== undefined ? sanitizeText(body.cloudinaryCloudName, 120) : store.getSettings().cloudinaryCloudName,
        cloudinaryUploadPreset: body.cloudinaryUploadPreset !== undefined ? sanitizeText(body.cloudinaryUploadPreset, 120) : store.getSettings().cloudinaryUploadPreset
      });
      return sendJson(res, 200, { settings: updated });
    },

    async syncPortfolio(req, res) {
      const body = await readJsonBody(req);
      const synced = store.syncPortfolioState(body || {});
      if (typeof store.onPersistMongo === 'function') {
        try {
          await store.onPersistMongo(store.state);
        } catch (syncErr) {
          console.warn('[AdminController] Mongo persistence warning:', syncErr.message);
        }
      }
      return sendJson(res, 200, { synced: true, state: synced });
    }
  };
}

module.exports = { createAdminController };
