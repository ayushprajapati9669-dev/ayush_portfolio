const fs = require('fs');
const path = require('path');

// 1. Projects.jsx
const projPath = path.resolve('client/src/pages/Projects/Projects.jsx');
let projContent = fs.readFileSync(projPath, 'utf8');
if (!projContent.includes('rel="preload" as="image" href="/images/airbnb-clone-preview.webp"')) {
  projContent = projContent.replace(
    /<main className="projects-page min-h-\[1400px\]" ref=\{containerRef\}>/,
    `<main className="projects-page min-h-[1400px]" ref={containerRef}>\n      <link rel="preload" as="image" href="/images/airbnb-clone-preview.webp" type="image/webp" fetchPriority="high" />`
  );
  fs.writeFileSync(projPath, projContent);
  console.log('Added LCP preload link to Projects.jsx');
}

// 2. BackgroundLayers.jsx
const bgPath = path.resolve('client/src/components/layout/BackgroundLayers.jsx');
let bgContent = fs.readFileSync(bgPath, 'utf8');
if (!bgContent.includes('showDroplets')) {
  bgContent = bgContent.replace(
    /import React, \{ useEffect, useRef \} from 'react';/,
    "import React, { useState, useEffect, useRef } from 'react';"
  );
  bgContent = bgContent.replace(
    /const isAdmin = Boolean\([\s\S]*?\);\r?\n/,
    `const isAdmin = Boolean(
    location.pathname &&
    (location.pathname.startsWith('/admin') || location.pathname.startsWith('/login'))
  );

  const [showDroplets, setShowDroplets] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowDroplets(true), 150);
    return () => clearTimeout(timer);
  }, []);
`
  );
  bgContent = bgContent.replace(
    /\{!isCaseStudy && !isAdmin && \(/,
    '{!isCaseStudy && !isAdmin && showDroplets && ('
  );
  fs.writeFileSync(bgPath, bgContent);
  console.log('Optimized BackgroundLayers.jsx droplets mounting');
}

