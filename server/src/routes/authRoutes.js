async function handleAuthRoutes(req, res, pathname, authController) {
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    await authController.login(req, res);
    return true;
  }
  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    authController.logout(req, res);
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/auth/session') {
    authController.session(req, res);
    return true;
  }
  return false;
}

module.exports = { handleAuthRoutes };
