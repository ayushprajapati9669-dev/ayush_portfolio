#!/usr/bin/env node
/**
 * Secure Admin Bootstrap Script
 * Usage:
 *   ADMIN_USERNAME=ayush ADMIN_PASSWORD="YourStrongPassword123!" node server/scripts/setup-admin.js
 * Or pass as CLI flags:
 *   node server/scripts/setup-admin.js --username ayush --password "YourStrongPassword123!"
 *
 * Security policy: Refuses to create a hardcoded or weak password (< 10 chars).
 */
const path = require('path');
const { getEnvConfig } = require('../src/config/env');
const { PortfolioDataStore } = require('../src/repositories/portfolioRepository');
const { hashPassword } = require('../src/services/cryptoService');

function parseArgs() {
  const args = process.argv.slice(2);
  let username = process.env.ADMIN_USERNAME || '';
  let password = process.env.ADMIN_PASSWORD || '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--username' && args[i + 1]) username = args[++i];
    if (args[i] === '--password' && args[i + 1]) password = args[++i];
  }
  return { username: username.trim(), password };
}

function main() {
  const { username, password } = parseArgs();
  if (!username || username.length < 3) {
    console.error('Error: ADMIN_USERNAME (or --username) of at least 3 characters is required.');
    process.exit(1);
  }
  if (!password || password.length < 10) {
    console.error('Error: ADMIN_PASSWORD (or --password) of at least 10 characters is required. No default password is created.');
    process.exit(1);
  }
  const config = getEnvConfig();
  const store = new PortfolioDataStore(path.join(config.dataDir, 'portfolio.json'));
  const passwordHash = hashPassword(password);
  const result = store.upsertAdminUser(username, passwordHash);
  console.log(`Admin account "${result.username}" configured with scrypt password hashing.`);
}

main();
