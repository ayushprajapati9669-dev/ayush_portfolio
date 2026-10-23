async function handlePublicRoutes(req, res, pathname, parsedUrl, publicController) {
  if (req.method === 'GET' && pathname === '/api/health') {
    publicController.getHealth(req, res);
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/public/bootstrap') {
    publicController.getBootstrap(req, res);
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/public/profile') {
    publicController.getProfile(req, res);
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/public/skills') {
    publicController.getSkills(req, res);
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/public/certificates') {
    publicController.getCertificates(req, res);
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/public/projects') {
    publicController.getProjects(req, res, parsedUrl);
    return true;
  }
  if (req.method === 'GET' && pathname.startsWith('/api/public/projects/')) {
    publicController.getProjectBySlug(req, res, pathname);
    return true;
  }
  if (req.method === 'POST' && pathname === '/api/public/contact') {
    await publicController.submitContact(req, res);
    return true;
  }
  if (req.method === 'GET' && (pathname === '/api/public/sitemap.xml' || pathname === '/sitemap.xml')) {
    publicController.getSitemap(req, res);
    return true;
  }
  return false;
}

module.exports = { handlePublicRoutes };
