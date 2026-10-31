const fs = require('fs');
const path = require('path');

// 1. SoundscapeStudio.jsx
const soundPath = path.join(__dirname, '..', 'client', 'src', 'components', 'ui', 'SoundscapeStudio.jsx');
let soundContent = fs.readFileSync(soundPath, 'utf8');

if (!soundContent.includes("useLocation")) {
  soundContent = soundContent.replace(
    "import React, { useState, useEffect, useRef } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';\nimport { useLocation } from 'react-router-dom';"
  );
  soundContent = soundContent.replace(
    "export function SoundscapeStudio() {\n  const [isOpen, setIsOpen] = useState(false);",
    "export function SoundscapeStudio() {\n  const location = useLocation();\n  const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');\n  const [isOpen, setIsOpen] = useState(false);"
  ).replace(
    "export function SoundscapeStudio() {\r\n  const [isOpen, setIsOpen] = useState(false);",
    "export function SoundscapeStudio() {\r\n  const location = useLocation();\r\n  const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');\r\n  const [isOpen, setIsOpen] = useState(false);"
  );

  // Before returning JSX, return null if isAdmin
  soundContent = soundContent.replace(
    "return (\n    <div ref={panelRef} className=\"fixed bottom-6 left-6 z-40\">",
    "if (isAdmin) return null;\n\n  return (\n    <div ref={panelRef} className=\"fixed bottom-6 left-6 z-40\">"
  ).replace(
    "return (\r\n    <div ref={panelRef} className=\"fixed bottom-6 left-6 z-40\">",
    "if (isAdmin) return null;\r\n\r\n  return (\r\n    <div ref={panelRef} className=\"fixed bottom-6 left-6 z-40\">"
  );

  fs.writeFileSync(soundPath, soundContent, 'utf8');
  console.log('Successfully patched SoundscapeStudio.jsx to hide on admin/login!');
} else {
  console.log('SoundscapeStudio already has useLocation');
}

// 2. AskAyushAiWidget.jsx
const aiPath = path.join(__dirname, '..', 'client', 'src', 'components', 'ui', 'AskAyushAiWidget.jsx');
let aiContent = fs.readFileSync(aiPath, 'utf8');

if (!aiContent.includes("useLocation")) {
  aiContent = aiContent.replace(
    "import { Link } from 'react-router-dom';",
    "import { Link, useLocation } from 'react-router-dom';"
  );
  aiContent = aiContent.replace(
    "export function AskAyushAiWidget() {\n  const [isOpen, setIsOpen] = useState(false);",
    "export function AskAyushAiWidget() {\n  const location = useLocation();\n  const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');\n  const [isOpen, setIsOpen] = useState(false);"
  ).replace(
    "export function AskAyushAiWidget() {\r\n  const [isOpen, setIsOpen] = useState(false);",
    "export function AskAyushAiWidget() {\r\n  const location = useLocation();\r\n  const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');\r\n  const [isOpen, setIsOpen] = useState(false);"
  );

  aiContent = aiContent.replace(
    "return (\n    <>",
    "if (isAdmin) return null;\n\n  return (\n    <>"
  ).replace(
    "return (\r\n    <>",
    "if (isAdmin) return null;\r\n\r\n  return (\r\n    <>"
  );

  fs.writeFileSync(aiPath, aiContent, 'utf8');
  console.log('Successfully patched AskAyushAiWidget.jsx to hide on admin/login!');
} else {
  console.log('AskAyushAiWidget already has useLocation');
}

