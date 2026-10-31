const fs = require('fs');
const path = require('path');

// 1. Read portfolio.json projects
const portfolioJsonPath = path.resolve('server/data/portfolio.json');
const portfolioJson = JSON.parse(fs.readFileSync(portfolioJsonPath, 'utf8'));
const publishedProjects = (portfolioJson.projects || []).filter(p => p.status === 'published');

// 2. Update defaultPortfolioState.js
const defaultsPath = path.resolve('client/src/services/defaultPortfolioState.js');
let defaultsContent = fs.readFileSync(defaultsPath, 'utf8');
defaultsContent = defaultsContent.replace(
  /projects:\s*\[\],/,
  `projects: ${JSON.stringify(publishedProjects, null, 2)},`
);
fs.writeFileSync(defaultsPath, defaultsContent);
console.log('Updated defaultPortfolioState.js with', publishedProjects.length, 'projects');

// 3. Update Projects.jsx with min-h-[1400px]
const projectsPath = path.resolve('client/src/pages/Projects/Projects.jsx');
let projectsContent = fs.readFileSync(projectsPath, 'utf8');
projectsContent = projectsContent.replace(
  /<main className="projects-page"/g,
  '<main className="projects-page min-h-[1400px]"'
);
fs.writeFileSync(projectsPath, projectsContent);
console.log('Updated Projects.jsx min-height');

