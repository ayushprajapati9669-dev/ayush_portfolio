const { readJsonBody, sendJson } = require('../utils/httpUtils');
const { validateContactInput } = require('../validators/portfolioValidators');
const { getLeetCodeMetrics } = require('../services/leetcodeService');
const analyticsService = require('../services/analyticsService');
const { generateAiAnswer } = require('../services/aiAssistantService');

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

    async getLeetCodeStats(req, res) {
      try {
        const stats = await getLeetCodeMetrics();
        res.setHeader('Cache-Control', 'public, max-age=600');
        return sendJson(res, 200, { success: true, stats });
      } catch (err) {
        return sendJson(res, 500, { success: false, error: err.message });
      }
    },

    async postTelemetry(req, res) {
      try {
        const body = await readJsonBody(req);
        const event = analyticsService.recordEvent(body || {});
        return sendJson(res, 200, { success: true, event });
      } catch (err) {
        return sendJson(res, 400, { success: false, error: err.message });
      }
    },

    async postAskAi(req, res) {
      try {
        const body = await readJsonBody(req);
        const answerData = generateAiAnswer(body.question || '', {
          profile: store.getProfile(),
          projects: store.getPublicProjects(),
          skills: store.getSkills(),
          certificates: store.getCertificates()
        });
        analyticsService.recordEvent({
          type: 'chat_query',
          path: '/ai-chat',
          title: `Query: ${body.question?.slice(0, 40)}`
        });
        return sendJson(res, 200, { success: true, ...answerData });
      } catch (err) {
        return sendJson(res, 500, { success: false, error: err.message });
      }
    },

    async handleLiveApiSandbox(req, res, pathname, parsedUrl) {
      const startTime = Date.now();
      const clientIp = req.socket.remoteAddress || '127.0.0.1';

      analyticsService.recordEvent({
        type: 'api_sandbox',
        path: pathname,
        title: `Sandbox API Execution: ${pathname}`
      });

      // Simulation latency to reflect real microservices
      await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 25) + 35));
      const latencyMs = Date.now() - startTime;

      res.setHeader('X-Response-Time', `${latencyMs}ms`);
      res.setHeader('X-RateLimit-Limit', '120');
      res.setHeader('X-RateLimit-Remaining', '118');
      res.setHeader('X-Cache-Status', 'HIT - Redis v7.2-Cluster');

      // 1. Property search
      if (pathname === '/api/v1/properties/search') {
        const city = parsedUrl?.searchParams?.get('city') || 'bhopal';
        const guests = parsedUrl?.searchParams?.get('guests') || '2';
        return sendJson(res, 200, {
          status: 'success',
          code: 200,
          latency: `${latencyMs}ms`,
          query: { city, guests },
          pagination: { totalResults: 28, page: 1, pageSize: 5 },
          data: [
            {
              id: 'prop-101',
              title: 'Lakeview Heritage Villa & Pool',
              city: 'Bhopal',
              pricePerNightINR: 4850,
              rating: 4.94,
              reviewsCount: 128,
              amenities: ['High-speed Wi-Fi', 'Solar Heated Pool', 'Kitchenette', 'EV Charger'],
              instantBook: true,
              cacheHit: true
            },
            {
              id: 'prop-102',
              title: 'Upper Lake Sunset Loft',
              city: 'Bhopal',
              pricePerNightINR: 3200,
              rating: 4.88,
              reviewsCount: 84,
              amenities: ['Lake View Balcony', 'Workspace Desk', 'AC'],
              instantBook: true,
              cacheHit: true
            }
          ]
        });
      }

      // 2. Demo Auth Session
      if (pathname === '/api/v1/auth/demo-session' && req.method === 'POST') {
        return sendJson(res, 201, {
          status: 'success',
          code: 201,
          latency: `${latencyMs}ms`,
          tokenType: 'Bearer',
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_recruiter_session_active.hash',
          expiresIn: 3600,
          user: {
            id: 'recruiter-demo-01',
            role: 'Guest Inspector',
            permissions: ['read:all', 'test:sandbox', 'view:telemetry']
          }
        });
      }

      // 3. Agentic workspace status
      if (pathname === '/api/v1/agent/status') {
        return sendJson(res, 200, {
          status: 'active',
          code: 200,
          latency: `${latencyMs}ms`,
          activeNodes: 4,
          taskQueueLength: 0,
          memoryUsageMb: 84.2,
          lastSync: new Date().toISOString()
        });
      }

      // Default sandbox endpoint
      return sendJson(res, 200, {
        status: 'success',
        code: 200,
        latency: `${latencyMs}ms`,
        path: pathname,
        message: 'Sandbox query executed successfully against simulated microservice cluster.'
      });
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
    },

    getSitemap(req, res) {
      const host = req.headers.host || 'localhost:6000';
      const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
      const origin = `${protocol}://${host}`;

      const now = new Date().toISOString().split('T')[0];
      const projects = store.getPublicProjects() || [];
      const profile = store.getProfile() || {};
      const lastModDate = profile.updatedAt ? new Date(profile.updatedAt).toISOString().split('T')[0] : now;

      const staticPages = [
        { path: '', changefreq: 'daily', priority: '1.0' },
        { path: 'about', changefreq: 'weekly', priority: '0.8' },
        { path: 'skills', changefreq: 'weekly', priority: '0.8' },
        { path: 'projects', changefreq: 'daily', priority: '0.9' },
        { path: 'certificates', changefreq: 'weekly', priority: '0.8' },
        { path: 'contact', changefreq: 'monthly', priority: '0.7' }
      ];

      const staticUrls = staticPages.map((page) => {
        const loc = page.path ? `${origin}/${page.path}` : `${origin}/`;
        return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      });

      const projectUrls = projects.map((p) => {
        const slug = p.slug || p.id;
        const pMod = p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : lastModDate;
        return `  <url>
    <loc>${origin}/projects/${encodeURIComponent(slug)}</loc>
    <lastmod>${pMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join('\n')}
${projectUrls.join('\n')}
</urlset>`;

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.end(sitemapXml);
    }
  };
}

module.exports = { createPublicController };
