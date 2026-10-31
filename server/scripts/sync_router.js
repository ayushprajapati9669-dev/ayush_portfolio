const fs = require('fs');
const path = require('path');

const routerPath = path.resolve('client/src/app/router.jsx');
let r = fs.readFileSync(routerPath, 'utf8');

r = r.replace(
  "import { HomePage } from '../pages/Home/Home';",
  "import { HomePage } from '../pages/Home/Home';\nimport { ProjectsPage } from '../pages/Projects/Projects';"
);

r = r.replace(
  /const ProjectsPage = React\.lazy\(\(\) => import\('\.\.\/pages\/Projects\/Projects'\)\.then\(m => \(\{ default: m\.ProjectsPage \}\)\)\);\r?\n/,
  ''
);

fs.writeFileSync(routerPath, r);
console.log('Updated router.jsx successfully!');

