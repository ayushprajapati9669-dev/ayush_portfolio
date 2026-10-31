const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'server', 'data', 'portfolio.json'), 'utf8'));

console.log('--- PROJECT 0 SAMPLE ---');
console.log(JSON.stringify(data.projects[0], null, 2));

console.log('--- CERTIFICATE 0 SAMPLE ---');
console.log(JSON.stringify(data.certificates[0], null, 2));

console.log('--- JOURNEY 0 SAMPLE ---');
console.log(JSON.stringify(data.profile.learningJourney[0], null, 2));
