const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'server', 'data', 'portfolio.json'), 'utf8'));

console.log('=== ALL PROJECTS ===');
data.projects.forEach(p => {
  console.log({
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    technologies: p.technologies,
    liveDemoUrl: p.liveDemoUrl,
    githubUrl: p.githubUrl
  });
});

console.log('=== ALL CERTIFICATES ===');
data.certificates.forEach(c => {
  console.log({
    id: c.id,
    title: c.title,
    issuer: c.issuer,
    issueDate: c.issueDate,
    skillsCovered: c.skillsCovered,
    imageUrl: c.imageUrl
  });
});

console.log('=== ALL JOURNEY MILESTONES ===');
(data.profile.learningJourney || []).forEach(m => {
  console.log({
    id: m.id,
    title: m.title,
    year: m.year,
    metaLabel: m.metaLabel,
    spotlight: m.spotlight,
    published: m.published
  });
});

