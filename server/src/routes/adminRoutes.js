const { requireAdminAuth } = require('../middleware/authMiddleware');

async function handleAdminRoutes(req, res, pathname, config, adminController) {
  if (req.method === 'POST' && pathname === '/api/portfolio/sync') {
    const session = requireAdminAuth(req, res, config, false);
    if (!session) return true;
    await adminController.syncPortfolio(req, res);
    return true;
  }

  if (!pathname.startsWith('/api/admin')) {
    return false;
  }

  const session = requireAdminAuth(req, res, config, true);
  if (!session) return true;

  if (req.method === 'GET' && pathname === '/api/admin/summary') {
    adminController.getSummary(req, res);
    return true;
  }
  if (req.method === 'PUT' && pathname === '/api/admin/profile') {
    await adminController.updateProfile(req, res);
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/admin/projects') {
    adminController.listProjects(req, res);
    return true;
  }
  if (req.method === 'GET' && pathname.startsWith('/api/admin/projects/preview/')) {
    adminController.previewProject(req, res, pathname);
    return true;
  }
  if (req.method === 'POST' && pathname === '/api/admin/projects') {
    await adminController.createProject(req, res);
    return true;
  }
  if (req.method === 'PUT' && pathname.startsWith('/api/admin/projects/')) {
    await adminController.updateProject(req, res, pathname);
    return true;
  }
  if (req.method === 'DELETE' && pathname.startsWith('/api/admin/projects/')) {
    adminController.deleteProject(req, res, pathname);
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/admin/certificates') {
    adminController.listCertificates(req, res);
    return true;
  }
  if (req.method === 'POST' && pathname === '/api/admin/certificates') {
    await adminController.upsertCertificate(req, res);
    return true;
  }
  if (req.method === 'DELETE' && pathname.startsWith('/api/admin/certificates/')) {
    adminController.deleteCertificate(req, res, pathname);
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/admin/skills') {
    adminController.listSkills(req, res);
    return true;
  }
  if (req.method === 'POST' && pathname === '/api/admin/skills') {
    await adminController.upsertSkillCategory(req, res);
    return true;
  }
  if (req.method === 'DELETE' && pathname.startsWith('/api/admin/skills/')) {
    adminController.deleteSkillCategory(req, res, pathname);
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/admin/media') {
    adminController.listMedia(req, res);
    return true;
  }
  if (req.method === 'POST' && pathname === '/api/admin/media') {
    await adminController.uploadMedia(req, res);
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/admin/messages') {
    adminController.listMessages(req, res);
    return true;
  }
  if (req.method === 'PATCH' && pathname.startsWith('/api/admin/messages/')) {
    await adminController.updateMessageStatus(req, res, pathname);
    return true;
  }
  if (req.method === 'DELETE' && pathname.startsWith('/api/admin/messages/')) {
    adminController.deleteMessage(req, res, pathname);
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/admin/settings') {
    adminController.getSettings(req, res);
    return true;
  }
  if (req.method === 'PUT' && pathname === '/api/admin/settings') {
    await adminController.updateSettings(req, res);
    return true;
  }

  return false;
}

module.exports = { handleAdminRoutes };
