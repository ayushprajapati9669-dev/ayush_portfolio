const { readJsonBody, sendJson } = require('../utils/httpUtils');
const { validateContactInput } = require('../validators/portfolioValidators');

function createPublicController({ store, contactLimiter }) {
  return {
    getHealth(req, res) {
      return sendJson(res, 200, {
        status: 'ok',
        storageEngine: store.mode,
        adminConfigured: store.hasAnyAdmin(),
        timestamp: new Date().toISOString()
      });
    },

    getBootstrap(req, res) {
      return sendJson(res, 200, {
        profile: store.getProfile(),
        projects: store.getPublicProjects(),
        skills: store.getSkills(),
        certificates: store.getCertificates(),
        resumes: store.getResumes ? store.getResumes() : (store.state.resumes || []),
        settings: store.getSettings(),
        uiLabels: store.state.uiLabels || {}
      });
    },

    getProfile(req, res) {
      return sendJson(res, 200, { profile: store.getProfile() });
    },

    getSkills(req, res) {
      return sendJson(res, 200, { skills: store.getSkills() });
    },

    getCertificates(req, res) {
      return sendJson(res, 200, { certificates: store.getCertificates() });
    },

    getProjects(req, res, parsedUrl) {
      const category = parsedUrl.searchParams.get('category');
      return sendJson(res, 200, { projects: store.getPublicProjects(category) });
    },

    getProjectBySlug(req, res, pathname) {
      const slug = decodeURIComponent(pathname.replace('/api/public/projects/', ''));
      const project = store.getPublicProjectBySlug(slug);
      if (!project) {
        return sendJson(res, 404, { error: 'Published project case study not found.' });
      }
      return sendJson(res, 200, { project });
    },

    async submitContact(req, res) {
      const clientIp = req.socket.remoteAddress || '127.0.0.1';
      const limitCheck = contactLimiter.check(clientIp);
      if (!limitCheck.allowed) {
        return sendJson(res, 429, {
          error: 'Too many contact submissions from this address. Please try again later.'
        });
      }
      const body = await readJsonBody(req);
      const validation = validateContactInput(body);
      if (!validation.valid) {
        return sendJson(res, 400, { error: 'Validation failed', details: validation.errors });
      }
      const saved = store.createMessage(validation.data);
      return sendJson(res, 201, {
        message: 'Thank you! Your message has been sent successfully. Ayush will get back to you shortly.',
        deliveryMode: 'database-persisted',
        record: {
          id: saved.id,
          createdAt: saved.createdAt
        }
      });
    }
  };
}

module.exports = { createPublicController };
