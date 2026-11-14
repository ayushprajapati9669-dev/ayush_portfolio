const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) files = files.concat(walk(p));
    else if (p.endsWith('.js') || p.endsWith('.jsx')) files.push(p);
  });
  return files;
}

const adminFiles = walk('client/src/pages/Admin');
const publicFiles = walk('client/src').filter(f => !f.includes('pages\\Admin') && !f.includes('pages/Admin'));

const adminImports = new Map();
adminFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const re = /from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const importPath = m[1];
    if (importPath.startsWith('.')) {
      const resolved = path.resolve(path.dirname(f), importPath);
      adminImports.set(resolved, f);
    }
  }
});

console.log('Total admin relative imports:', adminImports.size);

publicFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const re = /from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const importPath = m[1];
    if (importPath.startsWith('.')) {
      const resolved = path.resolve(path.dirname(f), importPath);
      if (adminImports.has(resolved)) {
        console.log('SHARED:', path.relative('client/src', resolved), '<- imported by public:', path.relative('client/src', f), 'and admin:', path.relative('client/src', adminImports.get(resolved)));
      }
    }
  }
});

