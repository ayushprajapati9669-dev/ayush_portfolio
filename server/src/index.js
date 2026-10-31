const { createPortfolioServer } = require('./app');
const { connectMongoDB } = require('./config/db');

const { server, config, store } = createPortfolioServer();

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[Argon Portfolio Server] Port ${config.port} is already in use by another process.`);
    console.error(`[Argon Portfolio Server] Please close the running process or choose a different port.\n`);
    process.exit(1);
  } else {
    console.error('[Argon Portfolio Server] Server error:', err);
    process.exit(1);
  }
});

connectMongoDB(config.mongoUri, store).finally(() => {
  server.listen(config.port, () => {
    console.log(`[Argon Portfolio Server] Listening on http://localhost:${config.port}`);
    console.log(`[Argon Portfolio Server] Storage engine: ${store.mode}`);
    console.log(`[Argon Portfolio Server] Admin configured: ${store.hasAnyAdmin()}`);
  });
});
