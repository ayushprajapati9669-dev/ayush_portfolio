#!/usr/bin/env node
const path = require('path');
const { getEnvConfig } = require('../src/config/env');
const { PortfolioDataStore } = require('../src/repositories/portfolioRepository');

const config = getEnvConfig();
const store = new PortfolioDataStore(path.join(config.dataDir, 'portfolio.json'));
store.resetToSeed();
console.log('Portfolio database reset to verified initial seed state for Ayush Prajapati.');
