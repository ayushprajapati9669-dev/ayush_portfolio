const { handlePublicRoutes } = require('./publicRoutes');
const { handleAuthRoutes } = require('./authRoutes');
const { handleAdminRoutes } = require('./adminRoutes');

async function dispatchApiRoutes(req, res, pathname, parsedUrl, controllers, config) {
  if (await handlePublicRoutes(req, res, pathname, parsedUrl, controllers.publicController)) {
    return true;
  }
  if (await handleAuthRoutes(req, res, pathname, controllers.authController)) {
    return true;
  }
  if (await handleAdminRoutes(req, res, pathname, config, controllers.adminController)) {
    return true;
  }
  return false;
}

module.exports = { dispatchApiRoutes };
