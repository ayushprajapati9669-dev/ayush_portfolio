const fs = require('fs');
const path = require('path');

const filePath = path.resolve('client/src/pages/Admin/components/AdminProjects.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const target1 = `  const handleCancelEdit = () => {
    playTick();
    setEditingId(null);
    setCurrentStep(1);`;

const targetCRLF = `  const handleCancelEdit = () => {\r\n    playTick();\r\n    setEditingId(null);\r\n    setCurrentStep(1);`;

const replacement = `  const handleCancelEdit = () => {
    playTick();
    setEditingId(null);
    setIsFormOpen(false);
    setCurrentStep(1);`;

const replacementCRLF = `  const handleCancelEdit = () => {\r\n    playTick();\r\n    setEditingId(null);\r\n    setIsFormOpen(false);\r\n    setCurrentStep(1);`;

if (content.includes(targetCRLF)) {
  content = content.replace(targetCRLF, replacementCRLF);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully replaced CRLF');
} else if (content.includes(target1)) {
  content = content.replace(target1, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully replaced LF');
} else {
  console.error('Target not found!');
  process.exit(1);
}

