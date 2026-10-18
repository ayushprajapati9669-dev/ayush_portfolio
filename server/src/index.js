const { createPortfolioServer } = require('./app');
const { connectMongoDB } = require('./config/db');

const { server, config, store } = createPortfolioServer();

connectMongoDB(config.mongoUri, store).finally(() => {
  server.listen(config.port, () => {
    console.log(`[Argon Portfolio Server] Listening on http://localhost:${config.port}`);
    console.log(`[Argon Portfolio Server] Storage engine: ${store.mode}`);
    console.log(`[Argon Portfolio Server] Admin configured: ${store.hasAnyAdmin()}`);
  });
});
