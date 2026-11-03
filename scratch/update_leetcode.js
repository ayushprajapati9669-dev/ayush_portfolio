const fs = require('fs');
const path = require('path');

const filePath = path.resolve('client/src/components/ui/LeetCodeMetricsBadge.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update radius and circumference comment
content = content.replace(
  '// SVG Ring Calculations (circumference = 2 * PI * 110 = 691.15)\n  const radius = 110;\n  const circumference = 2 * Math.PI * radius; // 691.15',
  '// SVG Ring Calculations (circumference = 2 * PI * 76 = 477.52)\n  const radius = 76;\n  const circumference = 2 * Math.PI * radius; // 477.52'
);

// If CRLF
content = content.replace(
  '// SVG Ring Calculations (circumference = 2 * PI * 110 = 691.15)\r\n  const radius = 110;\r\n  const circumference = 2 * Math.PI * radius; // 691.15',
  '// SVG Ring Calculations (circumference = 2 * PI * 76 = 477.52)\r\n  const radius = 76;\r\n  const circumference = 2 * Math.PI * radius; // 477.52'
);

// Update logo icon width/height from 24 to 20
content = content.replace(
  '<div className="lmc-logo-icon">\n            <svg\n              width="24"\n              height="24"',
  '<div className="lmc-logo-icon">\n            <svg\n              width="20"\n              height="20"'
);
content = content.replace(
  '<div className="lmc-logo-icon">\r\n            <svg\r\n              width="24"\r\n              height="24"',
  '<div className="lmc-logo-icon">\r\n            <svg\r\n              width="20"\r\n              height="20"'
);

// Update inspect profile svg size
content = content.replace(
  '<span>Inspect Profile</span>\n          <svg\n            width="14"\n            height="14"',
  '<span>Inspect Profile</span>\n          <svg\n            width="13"\n            height="13"'
);
content = content.replace(
  '<span>Inspect Profile</span>\r\n          <svg\r\n            width="14"\r\n            height="14"',
  '<span>Inspect Profile</span>\r\n          <svg\r\n            width="13"\r\n            height="13"'
);

// Update SVG ring viewBox and circles cx/cy/r
content = content.replace(
  '<svg className="lmc-hero-ring-svg" viewBox="0 0 240 240">',
  '<svg className="lmc-hero-ring-svg" viewBox="0 0 176 176">'
);

content = content.replace(
  '<circle className="lmc-hero-ring-bg" cx="120" cy="120" r="110" />',
  '<circle className="lmc-hero-ring-bg" cx="88" cy="88" r="76" />'
);

content = content.replace(
  '<circle\n                className="lmc-hero-ring-progress"\n                cx="120"\n                cy="120"\n                r="110"',
  '<circle\n                className="lmc-hero-ring-progress"\n                cx="88"\n                cy="88"\n                r="76"'
);
content = content.replace(
  '<circle\r\n                className="lmc-hero-ring-progress"\r\n                cx="120"\r\n                cy="120"\r\n                r="110"',
  '<circle\r\n                className="lmc-hero-ring-progress"\r\n                cx="88"\r\n                cy="88"\r\n                r="76"'
);

// Update translate(110px) to translate(76px)
content = content.replace(
  'translate(110px) rotate(-${tipAngle}deg)',
  'translate(76px) rotate(-${tipAngle}deg)'
);

// Update acceptance badge icon size
content = content.replace(
  '<div className="lmc-acceptance-badge">\n            <svg\n              width="16"\n              height="16"',
  '<div className="lmc-acceptance-badge">\n            <svg\n              width="14"\n              height="14"'
);
content = content.replace(
  '<div className="lmc-acceptance-badge">\r\n            <svg\r\n              width="16"\r\n              height="16"',
  '<div className="lmc-acceptance-badge">\r\n            <svg\r\n              width="14"\r\n              height="14"'
);

// Update check circle icon size
content = content.replace(
  '<div className="lmc-check-circle">\n                        <svg\n                          width="12"\n                          height="12"',
  '<div className="lmc-check-circle">\n                        <svg\n                          width="10"\n                          height="10"'
);
content = content.replace(
  '<div className="lmc-check-circle">\r\n                        <svg\r\n                          width="12"\r\n                          height="12"',
  '<div className="lmc-check-circle">\r\n                        <svg\r\n                          width="10"\r\n                          height="10"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated LeetCodeMetricsBadge.jsx');

