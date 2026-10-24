const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { INITIAL_SEED_DATA } = require('../models/seedData');

class PortfolioDataStore {
  constructor(dataFilePath) {
    this.dataFilePath = dataFilePath;
    this.mode = 'json-document-store';
    this._ensureLoaded();
  }

  _ensureLoaded() {
    const dir = path.dirname(this.dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.dataFilePath)) {
      this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
      this._persist();
    } else {
      try {
        const raw = fs.readFileSync(this.dataFilePath, 'utf8');
        this.state = JSON.parse(raw);
      } catch (_err) {
        this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
        this._persist();
      }
    }
  }

  _persist() {
    const tmpFile = `${this.dataFilePath}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(this.state, null, 2), 'utf8');
    fs.renameSync(tmpFile, this.dataFilePath);
    if (typeof this.onPersistMongo === 'function') {
      this.onPersistMongo(this.state);
    }
  }

  resetToSeed() {
    this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    this._persist();
    return this.state;
  }

  // Admin Users
  findAdminByUsername(username) {
    const clean = String(username || '').trim().toLowerCase();
    return (this.state.users || []).find(u => u.username.toLowerCase() === clean) || null;
  }

  hasAnyAdmin() {
    return Array.isArray(this.state.users) && this.state.users.length > 0;
  }

  upsertAdminUser(username, passwordHash) {
    if (!Array.isArray(this.state.users)) this.state.users = [];
    const clean = String(username || '').trim();
    const existing = this.findAdminByUsername(clean);
    const now = new Date().toISOString();
    if (existing) {
      existing.passwordHash = passwordHash;
      existing.updatedAt = now;
      this._persist();
      return { username: existing.username, role: existing.role, updatedAt: existing.updatedAt };
    }
    const created = {
      id: `usr-${crypto.randomBytes(6).toString('hex')}`,
      username: clean,
      passwordHash,
      role: 'admin',
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now
    };
    this.state.users.push(created);
    this._persist();
    return { username: created.username, role: created.role, createdAt: created.createdAt };
  }

  recordAdminLogin(username) {
    const user = this.findAdminByUsername(username);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      this._persist();
    }
  }

  // Profile
  getProfile() {
    return JSON.parse(JSON.stringify(this.state.profile));
  }

  updateProfile(patch) {
    this.state.profile = {
      ...this.state.profile,
      ...patch,
      education: {
        ...this.state.profile.education,
        ...(patch.education || {})
      },
      socialLinks: {
        ...this.state.profile.socialLinks,
        ...(patch.socialLinks || {})
      },
      portrait: {
        ...this.state.profile.portrait,
        ...(patch.portrait || {})
      },
      updatedAt: new Date().toISOString()
    };
    this._persist();
    return this.getProfile();
  }

  // Projects
  getPublicProjects(categoryFilter) {
    let list = (this.state.projects || []).filter(p => p.status === 'published');
    if (categoryFilter && categoryFilter !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === String(categoryFilter).toLowerCase());
    }
    return list
      .slice()
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map(p => JSON.parse(JSON.stringify(p)));
  }

  getPublicProjectBySlug(slug) {
    const found = (this.state.projects || []).find(
      p => (p.slug === slug || p.id === slug) && p.status === 'published'
    );
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  getAllProjectsAdmin() {
    return (this.state.projects || [])
      .slice()
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map(p => JSON.parse(JSON.stringify(p)));
  }

  getProjectByIdOrSlugAdmin(idOrSlug) {
    const found = (this.state.projects || []).find(
      p => p.id === idOrSlug || p.slug === idOrSlug
    );
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  createProject(projectData) {
    if (!Array.isArray(this.state.projects)) this.state.projects = [];
    if (this.state.projects.some(p => p.slug === projectData.slug)) {
      const err = new Error(`A project with slug "${projectData.slug}" already exists.`);
      err.statusCode = 409;
      throw err;
    }
    const now = new Date().toISOString();
    const newProj = {
      id: `proj-${crypto.randomBytes(5).toString('hex')}`,
      title: projectData.title,
      slug: projectData.slug,
      category: projectData.category || 'Full-Stack Web App',
      shortDescription: projectData.shortDescription,
      problemContext: projectData.problemContext || '',
      approachArchitecture: projectData.approachArchitecture || '',
      implementedFeatures: Array.isArray(projectData.implementedFeatures) ? projectData.implementedFeatures : [],
      lessonsLearned: projectData.lessonsLearned || '',
      disclaimer: projectData.disclaimer || '',
      technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [],
      thumbnailType: projectData.thumbnailType || 'image',
      thumbnailUrl: projectData.thumbnailUrl || '',
      galleryImages: Array.isArray(projectData.galleryImages) ? projectData.galleryImages : [],
      githubUrl: projectData.githubUrl || '',
      liveDemoUrl: projectData.liveDemoUrl || '',
      featured: Boolean(projectData.featured),
      caseStudy: projectData.caseStudy || null,
      status: projectData.status === 'published' ? 'published' : 'draft',
      displayOrder: typeof projectData.displayOrder === 'number' ? projectData.displayOrder : this.state.projects.length + 1,
      createdAt: now,
      updatedAt: now
    };
    this.state.projects.push(newProj);
    this._persist();
    return JSON.parse(JSON.stringify(newProj));
  }

  updateProject(id, patch) {
    const idx = (this.state.projects || []).findIndex(p => p.id === id);
    if (idx === -1) return null;
    if (patch.slug && this.state.projects.some((p, i) => i !== idx && p.slug === patch.slug)) {
      const err = new Error(`Slug "${patch.slug}" is already used by another project.`);
      err.statusCode = 409;
      throw err;
    }
    const current = this.state.projects[idx];
    const updated = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString()
    };
    this.state.projects[idx] = updated;
    this._persist();
    return JSON.parse(JSON.stringify(updated));
  }

  deleteProject(id) {
    const idx = (this.state.projects || []).findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.state.projects.splice(idx, 1);
    this._persist();
    return true;
  }

  // Certificates
  getCertificates() {
    return JSON.parse(JSON.stringify(this.state.certificates || []));
  }

  upsertCertificate(certPayload) {
    if (!Array.isArray(this.state.certificates)) this.state.certificates = [];
    const now = new Date().toISOString();
    if (certPayload.id) {
      const idx = this.state.certificates.findIndex(c => c.id === certPayload.id);
      if (idx !== -1) {
        this.state.certificates[idx] = {
          ...this.state.certificates[idx],
          ...certPayload,
          updatedAt: now
        };
        this._persist();
        return JSON.parse(JSON.stringify(this.state.certificates[idx]));
      }
    }
    const created = {
      id: `cert-${crypto.randomBytes(4).toString('hex')}`,
      title: certPayload.title,
      issuer: certPayload.issuer,
      issueDate: certPayload.issueDate || '2025',
      credentialId: certPayload.credentialId || '',
      credentialUrl: certPayload.credentialUrl || '',
      skillsCovered: certPayload.skillsCovered || '',
      imageUrl: certPayload.imageUrl || '',
      createdAt: now,
      updatedAt: now
    };
    this.state.certificates.unshift(created);
    this._persist();
    return JSON.parse(JSON.stringify(created));
  }

  deleteCertificate(id) {
    const idx = (this.state.certificates || []).findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.state.certificates.splice(idx, 1);
    this._persist();
    return true;
  }

  // Skills
  getSkills() {
    return (this.state.skills || [])
      .slice()
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map(s => JSON.parse(JSON.stringify(s)));
  }

  upsertSkillCategory(categoryPayload) {
    if (!Array.isArray(this.state.skills)) this.state.skills = [];
    const now = new Date().toISOString();
    if (categoryPayload.id) {
      const idx = this.state.skills.findIndex(s => s.id === categoryPayload.id);
      if (idx !== -1) {
        this.state.skills[idx] = {
          ...this.state.skills[idx],
          ...categoryPayload,
          updatedAt: now
        };
        this._persist();
        return JSON.parse(JSON.stringify(this.state.skills[idx]));
      }
    }
    const created = {
      id: `skill-cat-${crypto.randomBytes(4).toString('hex')}`,
      category: categoryPayload.category,
      description: categoryPayload.description || '',
      displayOrder: typeof categoryPayload.displayOrder === 'number' ? categoryPayload.displayOrder : this.state.skills.length + 1,
      items: Array.isArray(categoryPayload.items) ? categoryPayload.items : [],
      updatedAt: now
    };
    this.state.skills.push(created);
    this._persist();
    return JSON.parse(JSON.stringify(created));
  }

  deleteSkillCategory(id) {
    const idx = (this.state.skills || []).findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.state.skills.splice(idx, 1);
    this._persist();
    return true;
  }

  // Media
  getMediaList() {
    return JSON.parse(JSON.stringify(this.state.media || []));
  }

  addMediaRecord(record) {
    if (!Array.isArray(this.state.media)) this.state.media = [];
    const item = {
      id: `media-${crypto.randomBytes(5).toString('hex')}`,
      ...record,
      createdAt: new Date().toISOString()
    };
    this.state.media.unshift(item);
    this._persist();
    return JSON.parse(JSON.stringify(item));
  }

  // Messages
  createMessage(msgPayload) {
    if (!Array.isArray(this.state.messages)) this.state.messages = [];
    const now = new Date().toISOString();
    const item = {
      id: `msg-${crypto.randomBytes(5).toString('hex')}`,
      name: msgPayload.name,
      email: msgPayload.email,
      subject: msgPayload.subject,
      message: msgPayload.message,
      status: 'unread',
      createdAt: now,
      updatedAt: now
    };
    this.state.messages.unshift(item);
    this._persist();
    return JSON.parse(JSON.stringify(item));
  }

  getMessagesAdmin() {
    return JSON.parse(JSON.stringify(this.state.messages || []));
  }

  updateMessageStatus(id, status) {
    const found = (this.state.messages || []).find(m => m.id === id);
    if (!found) return null;
    found.status = status === 'read' ? 'read' : 'unread';
    found.updatedAt = new Date().toISOString();
    this._persist();
    return JSON.parse(JSON.stringify(found));
  }

  deleteMessage(id) {
    const idx = (this.state.messages || []).findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.state.messages.splice(idx, 1);
    this._persist();
    return true;
  }

  // Settings
  getSettings() {
    return JSON.parse(JSON.stringify(this.state.settings || {}));
  }

  updateSettings(patch) {
    this.state.settings = {
      ...this.state.settings,
      ...patch,
      updatedAt: new Date().toISOString()
    };
    this._persist();
    return this.getSettings();
  }

  // Resumes
  getResumes() {
    return JSON.parse(JSON.stringify(this.state.resumes || []));
  }

  upsertResume(resumeData) {
    if (!Array.isArray(this.state.resumes)) this.state.resumes = [];
    const now = new Date().toISOString();
    const id = resumeData.id || `res-${crypto.randomBytes(6).toString('hex')}`;
    const clean = {
      id,
      title: String(resumeData.title || 'Ayush Prajapati - Official Resume').trim(),
      fileName: String(resumeData.fileName || 'Ayush_Prajapati_Resume.pdf').trim(),
      fileUrl: String(resumeData.fileUrl || '').trim(),
      fileType: String(resumeData.fileType || 'application/pdf').trim(),
      sizeBytes: Number(resumeData.sizeBytes) || 0,
      uploadedAt: resumeData.uploadedAt || now,
      isActive: resumeData.isActive !== false
    };

    // If active, make sure other resumes are inactive
    if (clean.isActive) {
      this.state.resumes.forEach(r => { r.isActive = false; });
      if (clean.fileUrl) {
        if (!this.state.profile) this.state.profile = {};
        this.state.profile.resumeUrl = clean.fileUrl;
      }
    }

    const idx = this.state.resumes.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.state.resumes[idx] = { ...this.state.resumes[idx], ...clean };
    } else {
      this.state.resumes.unshift(clean);
    }
    this._persist();
    return clean;
  }

  deleteResume(id) {
    if (!Array.isArray(this.state.resumes)) return false;
    const idx = this.state.resumes.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.state.resumes.splice(idx, 1);
    this._persist();
    return true;
  }

  // Full state sync (used by v4 Admin CMS sync)
  syncPortfolioState(payload) {
    if (payload.profile && typeof payload.profile === 'object') {
      this.state.profile = { ...this.state.profile, ...payload.profile };
    }
    if (Array.isArray(payload.projects)) {
      this.state.projects = payload.projects;
    }
    if (Array.isArray(payload.skills)) {
      this.state.skills = payload.skills;
    }
    if (Array.isArray(payload.certificates)) {
      this.state.certificates = payload.certificates;
    }
    if (Array.isArray(payload.resumes)) {
      this.state.resumes = payload.resumes;
    }
    if (Array.isArray(payload.messages)) {
      this.state.messages = payload.messages;
    }
    if (payload.settings && typeof payload.settings === 'object') {
      this.state.settings = { ...this.state.settings, ...payload.settings };
    }
    if (payload.uiLabels && typeof payload.uiLabels === 'object') {
      this.state.uiLabels = { ...(this.state.uiLabels || {}), ...payload.uiLabels };
    }
    this._persist();
    return {
      profile: this.getProfile(),
      projects: this.getAllProjectsAdmin(),
      skills: this.getSkills(),
      certificates: this.getCertificates(),
      resumes: this.getResumes(),
      settings: this.getSettings(),
      uiLabels: this.state.uiLabels || {}
    };
  }

  // Dashboard Summary
  getAdminSummary() {
    const projects = this.state.projects || [];
    const messages = this.state.messages || [];
    const certificates = this.state.certificates || [];
    const publishedCount = projects.filter(p => p.status === 'published').length;
    const draftCount = projects.filter(p => p.status === 'draft').length;
    const unreadMessagesCount = messages.filter(m => m.status === 'unread').length;
    const recentProjects = projects
      .slice()
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        status: p.status,
        featured: p.featured,
        updatedAt: p.updatedAt
      }));
    return {
      publishedProjectsCount: publishedCount,
      draftProjectsCount: draftCount,
      totalProjectsCount: projects.length,
      certificatesCount: certificates.length,
      totalMessagesCount: messages.length,
      unreadMessagesCount,
      skillCategoriesCount: (this.state.skills || []).length,
      mediaAssetsCount: (this.state.media || []).length,
      storageEngine: this.mode,
      recentProjects
    };
  }
}

module.exports = { PortfolioDataStore };
