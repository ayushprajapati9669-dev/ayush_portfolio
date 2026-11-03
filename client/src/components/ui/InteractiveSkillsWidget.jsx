import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';
import { ScrollWriteText } from '../common/ScrollWriteText';
import { TechLogo } from '../common/TechLogos';

// SVG Icon Render Map - Ultra-Crisp, High-Contrast Vector Emblems for Obsidian Glass
const SKILL_SVGS = {
  c: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#659AD2" d="M11.5 2.1L3.3 6.8c-.4.2-.6.7-.6 1.1v9.5c0 .5.2.9.6 1.1l8.2 4.7c.4.2.9.2 1.3 0l8.2-4.7c.4-.2.6-.7.6-1.1V7.9c0-.5-.2-.9-.6-1.1L12.7 2.1c-.3-.2-.8-.2-1.2 0z" />
      <path fill="#FFFFFF" d="M12 7c2.8 0 4.8 1.8 5.2 4.2h-2.5c-.3-1.2-1.4-2-2.7-2-2 0-3.3 1.5-3.3 3.6s1.3 3.6 3.3 3.6c1.3 0 2.4-.8 2.7-2h2.5c-.4 2.4-2.4 4.2-5.2 4.2-3.4 0-5.8-2.5-5.8-5.8s2.4-5.8 5.8-5.8z" />
    </svg>
  ),
  cpp: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#00599C" d="M11.5 2.1L3.3 6.8c-.4.2-.6.7-.6 1.1v9.5c0 .5.2.9.6 1.1l8.2 4.7c.4.2.9.2 1.3 0l8.2-4.7c.4-.2.6-.7.6-1.1V7.9c0-.5-.2-.9-.6-1.1L12.7 2.1c-.3-.2-.8-.2-1.2 0z" />
      <path fill="#FFFFFF" d="M10.5 8.4c1.7 0 2.9 1 3.4 2.4l-1.8.8c-.3-.8-.8-1.3-1.6-1.3-1.3 0-2.2 1.1-2.2 2.6s.9 2.6 2.2 2.6c.8 0 1.4-.5 1.7-1.3l1.8.8c-.6 1.4-1.8 2.4-3.5 2.4-2.4 0-4.2-1.9-4.2-4.5s1.8-4.5 4.2-4.5z" />
      <path fill="#00D4FF" d="M15.5 11.2h1v-1h1v1h1v1h-1v1h-1v-1h-1v-1zm4 0h1v-1h1v1h1v1h-1v1h-1v-1h-1v-1z" />
    </svg>
  ),
  java: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 6c1-2 3-3 5-3s2 1.5 1.5 3c-.5 1.5-2 2-2 3M11 5c1-1.5 2.5-2 4-2s1.5 1 1 2.5c-.5 1.5-1.5 2-1.5 2.5" fill="none" stroke="#F89820" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 11h11a1 1 0 011 1v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4a1 1 0 011-1z" fill="#007396" stroke="#F89820" strokeWidth="1.2" />
      <path d="M16 12h2a2 2 0 012 2v0a2 2 0 01-2 2h-2" fill="none" stroke="#F89820" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 21h14" stroke="#F89820" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  python: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.88 2c-5.05 0-4.73 2.19-4.73 2.19l.01 2.27h4.82v.68H5.25S2 6.77 2 11.84c0 5.07 2.83 4.89 2.83 4.89h1.69v-2.35s-.09-2.83 2.78-2.83h4.79s2.69.04 2.69-2.6V4.61S17.18 2 11.88 2zm-2.66 1.54c.48 0 .87.39.87.87 0 .48-.39.87-.87.87-.48 0-.87-.39-.87-.87 0-.48.39-.87.87-.87z" fill="#3776AB" />
      <path d="M12.12 22c5.05 0 4.73-2.19 4.73-2.19l-.01-2.27h-4.82v-.68h6.73S22 17.23 22 12.16c0-5.07-2.83-4.89-2.83-4.89h-1.69v2.35s.09 2.83-2.78 2.83H9.91s-2.69-.04-2.69 2.6v4.34S6.82 22 12.12 22zm2.66-1.54c-.48 0-.87-.39-.87-.87 0-.48.39-.87.87-.87.48 0 .87.39.87.87 0 .48-.39.87-.87.87z" fill="#FFD438" />
    </svg>
  ),
  js: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#F7DF1E" />
      <path d="M6.7 19.2c.4.7 1 1.2 2.1 1.2 1.1 0 1.8-.5 1.8-1.8v-6.9h2.1v7c0 2.4-1.4 3.5-3.6 3.5-1.9 0-3-.9-3.6-2.1l1.2-.9zm7.9-.2c.5.8 1.2 1.4 2.4 1.4 1 0 1.7-.5 1.7-1.2 0-.8-.7-1.1-1.8-1.6l-.6-.3c-1.8-.8-3-1.7-3-3.7 0-1.8 1.4-3.2 3.6-3.2 1.6 0 2.7.5 3.5 1.9l-1.9 1.2c-.4-.7-.9-1-1.6-1-.7 0-1.2.5-1.2 1 0 .7.5 1 1.6 1.5l.6.3c2.1.9 3.3 1.8 3.3 3.9 0 2.2-1.8 3.4-4.1 3.4-2.3 0-3.8-1.1-4.5-2.5l2-1.1z" fill="#090A0F" />
    </svg>
  ),
  ts: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#3178C6" />
      <path d="M11.5 12.3H8.8v6.7H7.1v-6.7H4.4V11h7.1v1.3zm6.6 2.4c0-1.7-1.1-2.4-2.8-2.9-.9-.3-1.4-.6-1.4-1.1 0-.5.5-.8 1.2-.8.8 0 1.5.4 1.8 1l1.1-.9c-.6-.9-1.6-1.5-2.9-1.5-1.9 0-3 1.1-3 2.5 0 1.6 1 2.3 2.6 2.8 1 .3 1.5.6 1.5 1.2 0 .6-.6.9-1.4.9-1 0-1.8-.5-2.2-1.2l-1.1.9c.7 1.1 1.8 1.8 3.3 1.8 2.1 0 3.3-1.2 3.3-2.7z" fill="#FFFFFF" />
    </svg>
  ),
  html: (
    <svg viewBox="0 0 24 24" fill="#E34F26" aria-hidden="true">
      <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" />
    </svg>
  ),
  css: (
    <svg viewBox="0 0 24 24" fill="#2965F1" aria-hidden="true">
      <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z" />
    </svg>
  ),
  react: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.2" fill="#61DAFB" />
      <ellipse cx="12" cy="12" rx="10" ry="4.3" stroke="#61DAFB" strokeWidth="1.6" />
      <ellipse cx="12" cy="12" rx="10" ry="4.3" stroke="#61DAFB" strokeWidth="1.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.3" stroke="#61DAFB" strokeWidth="1.6" transform="rotate(120 12 12)" />
    </svg>
  ),
  tailwind: (
    <svg viewBox="0 0 24 24" fill="#38BDF8" aria-hidden="true">
      <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
    </svg>
  ),
  responsive: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
      <rect x="2" y="4" width="13" height="11" rx="2" stroke="#38BDF8" />
      <path d="M5 19h7M8.5 15v4" stroke="#38BDF8" strokeLinecap="round" />
      <rect x="15" y="8" width="7" height="11" rx="1.5" stroke="#fcd34d" />
      <circle cx="18.5" cy="16.5" r=".7" fill="#fcd34d" />
    </svg>
  ),
  node: (
    <svg viewBox="0 0 24 24" fill="#5FA04E" aria-hidden="true">
      <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l7.44 4.3c.48.28 1.08.28 1.56 0l7.44-4.3c.48-.28.78-.8.78-1.36V7.71c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.51-.2-.78-.2zm0 2.2l6.6 3.8v7.6L12 19.25l-6.6-3.8v-7.6L12 4.05z" />
    </svg>
  ),
  express: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="4" fill="rgba(255,255,255,0.14)" stroke="#FFFFFF" strokeWidth="1.4" />
      <text x="12" y="15.5" textAnchor="middle" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontSize="10" fontWeight="900" letterSpacing="0.5">EX</text>
    </svg>
  ),
  api: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="3.5" fill="rgba(251, 191, 36, 0.15)" stroke="#fbbf24" strokeWidth="1.6" />
      <text x="12" y="15.2" textAnchor="middle" fill="#fbbf24" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="900" letterSpacing="0.8">API</text>
    </svg>
  ),
  mongo: (
    <svg viewBox="0 0 24 24" fill="#47A248" aria-hidden="true">
      <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z" />
    </svg>
  ),
  mysql: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#00758F" d="M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4zm0 2c4.42 0 8 1.12 8 2.5S16.42 9 12 9 4 7.88 4 6.5 7.58 4 12 4zm8 14c0 1.38-3.58 2.5-8 2.5S4 19.38 4 18v-2.2c1.8 1.05 4.7 1.7 8 1.7s6.2-.65 8-1.7V18zm0-5c0 1.38-3.58 2.5-8 2.5S4 14.38 4 13v-2.2c1.8 1.05 4.7 1.7 8 1.7s6.2-.65 8-1.7V13z" />
      <path fill="#F29111" d="M14.5 7.5c-1.2.2-2.3.9-2.9 1.9-.4.7-.5 1.5-.3 2.3.2.7.7 1.3 1.3 1.6.8.4 1.8.3 2.5-.2.5-.4.8-.9.9-1.5.1-.7-.1-1.4-.5-2-.3-.5-.6-.9-1-1.1z" />
    </svg>
  ),
  postgres: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#336791" d="M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4zm0 2c4.42 0 8 1.12 8 2.5S16.42 9 12 9 4 7.88 4 6.5 7.58 4 12 4zm8 14c0 1.38-3.58 2.5-8 2.5S4 19.38 4 18v-2.2c1.8 1.05 4.7 1.7 8 1.7s6.2-.65 8-1.7V18zm0-5c0 1.38-3.58 2.5-8 2.5S4 14.38 4 13v-2.2c1.8 1.05 4.7 1.7 8 1.7s6.2-.65 8-1.7V13z" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="#00D4FF" />
    </svg>
  ),
  git: (
    <svg viewBox="0 0 24 24" fill="#F05032" aria-hidden="true">
      <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  postman: (
    <svg viewBox="0 0 24 24" fill="#FF6C37" aria-hidden="true">
      <path d="M13.527.099C6.955-.744.942 3.9.099 10.473c-.843 6.572 3.8 12.584 10.373 13.428 6.573.843 12.587-3.801 13.428-10.374C24.744 6.955 20.101.943 13.527.099zm2.471 7.485a.855.855 0 00-.593.25l-4.453 4.453-.307-.307-.643-.643c4.389-4.376 5.18-4.418 5.996-3.753z" />
    </svg>
  ),
  docker: (
    <svg viewBox="0 0 24 24" fill="#2496ED" aria-hidden="true">
      <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.186.185.186zm0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186zm-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186zm-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186zm5.893 2.715h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186H8.1a.185.185 0 00-.185.186v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.186v1.888c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H2.208a.186.186 0 00-.186.186v1.888c0 .102.084.185.186.185m21.75 1.543c-.482-.372-1.397-.502-2.174-.407-.217.027-.433.08-.636.16-.144-.897-.568-1.579-1.282-2.03-.497-.314-1.09-.48-1.745-.48h-.274c-.062-.258-.168-.504-.316-.732a3.864 3.864 0 00-1.127-1.122c-.628-.39-1.36-.6-2.138-.6H.272a.272.272 0 00-.272.272v7.195c.01.556.126 1.106.345 1.62.775 1.815 2.302 3.238 4.195 3.908 2.213.784 4.887.828 7.32.12a14.28 14.28 0 004.81-2.656 12.3 12.3 0 002.56-2.684c.328-.517.587-1.077.77-1.664.922-.128 1.968-.53 2.193-1.08a.86.86 0 00-.236-.88z" />
    </svg>
  ),
  dsa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="5" r="2.8" fill="#00D4FF" fillOpacity="0.35" />
      <circle cx="5" cy="19" r="2.8" fill="#00D4FF" fillOpacity="0.35" />
      <circle cx="19" cy="19" r="2.8" fill="#00D4FF" fillOpacity="0.35" />
      <path d="M10.2 7.2L6.8 16.5M13.8 7.2L17.2 16.5M7.8 19h8.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

// 22 Reference Baseline Skills Dataset (matching deepseek_html_20261102_24e765.html)
const REFERENCE_SKILLS = [
  { name: 'C', category: 'languages', iconKey: 'c', color: '#A8B9CC' },
  { name: 'Java', category: 'languages', iconKey: 'java', color: '#f89820' },
  { name: 'Python', category: 'languages', iconKey: 'python', color: '#3776AB' },
  { name: 'JavaScript', category: 'languages', iconKey: 'js', color: '#F7DF1E' },
  { name: 'TypeScript', category: 'languages', iconKey: 'ts', color: '#3178C6' },
  { name: 'HTML5', category: 'frontend', iconKey: 'html', color: '#E34F26' },
  { name: 'CSS3', category: 'frontend', iconKey: 'css', color: '#1572B6' },
  { name: 'React.js', category: 'frontend', iconKey: 'react', color: '#61DAFB' },
  { name: 'Tailwind CSS', category: 'frontend', iconKey: 'tailwind', color: '#38BDF8' },
  { name: 'Responsive UI', category: 'frontend', iconKey: 'responsive', color: '#ffffff' },
  { name: 'Node.js', category: 'backend', iconKey: 'node', color: '#339933' },
  { name: 'Express.js', category: 'backend', iconKey: 'express', color: '#ffffff' },
  { name: 'REST APIs', category: 'backend', iconKey: 'api', color: '#fbbf24' },
  { name: 'MongoDB', category: 'databases', iconKey: 'mongo', color: '#47A248' },
  { name: 'MySQL', category: 'databases', iconKey: 'mysql', color: '#00758F' },
  { name: 'PostgreSQL', category: 'databases', iconKey: 'postgres', color: '#336791' },
  { name: 'Git', category: 'tools', iconKey: 'git', color: '#F05032' },
  { name: 'GitHub', category: 'tools', iconKey: 'github', color: '#ffffff' },
  { name: 'Postman', category: 'tools', iconKey: 'postman', color: '#FF6C37' },
  { name: 'Docker', category: 'tools', iconKey: 'docker', color: '#2496ED' },
  { name: 'C++', category: 'languages', iconKey: 'cpp', color: '#00599C' },
  { name: 'Data Structures', category: 'languages', iconKey: 'dsa', color: '#ffffff' }
];

// Normalize skill name to match reference dataset
const normalizeSkillKey = (name) => {
  const lower = (name || '').toLowerCase().trim();
  if (lower === 'html' || lower === 'html5') return 'html';
  if (lower === 'css' || lower === 'css3') return 'css';
  if (lower === 'js' || lower === 'javascript' || lower === 'es6') return 'js';
  if (lower === 'ts' || lower === 'typescript') return 'ts';
  if (lower === 'react' || lower === 'react.js' || lower === 'reactjs') return 'react';
  if (lower === 'node' || lower === 'nodejs' || lower === 'node.js') return 'node';
  if (lower === 'express' || lower === 'expressjs' || lower === 'express.js') return 'express';
  if (lower === 'tailwindcss' || lower === 'tailwind css' || lower === 'tailwind') return 'tailwind';
  if (lower.includes('rest api') || lower === 'api' || lower === 'rest') return 'api';
  if (lower === 'mongo' || lower === 'mongodb') return 'mongo';
  if (lower === 'postgres' || lower === 'postgresql') return 'postgres';
  if (lower === 'cpp' || lower === 'c++' || lower.includes('cplusplus')) return 'cpp';
  if (lower === 'c') return 'c';
  if (lower.includes('data struct') || lower === 'dsa' || lower.includes('algorithm')) return 'dsa';
  if (lower.includes('responsive')) return 'responsive';
  if (lower === 'github') return 'github';
  if (lower === 'git') return 'git';
  if (lower === 'postman') return 'postman';
  if (lower === 'docker') return 'docker';
  if (lower === 'mysql') return 'mysql';
  if (lower === 'java') return 'java';
  if (lower === 'python') return 'python';
  return lower;
};

// Skill icon mapper to key
const getSkillKeyFromItem = (item) => {
  if (!item) return null;
  const n = normalizeSkillKey(item.name || item.title || '');
  if (n && SKILL_SVGS[n]) return n;

  const rawKey = (item.iconKey || item.logoKey || '').toLowerCase().trim();
  if (SKILL_SVGS[rawKey]) return rawKey;
  if (rawKey === 'javascript') return 'js';
  if (rawKey === 'typescript') return 'ts';
  if (rawKey === 'nodejs') return 'node';
  if (rawKey === 'mongodb') return 'mongo';
  if (rawKey === 'postgresql') return 'postgres';
  if (rawKey === 'cplusplus' || rawKey === 'c++') return 'cpp';

  return null;
};

export function SkillsSection({ isStandalonePage = false, showCta = false, onCtaClick = null }) {
  const { appState } = usePortfolio();
  const ui = appState?.uiLabels || {};
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const gridRef = useRef(null);

  // Signature brand colors for dynamic skill ambient underglow
const SKILL_BRAND_COLORS = {
  javascript: '#F7DF1E',
  typescript: '#3178C6',
  react: '#61DAFB',
  'react.js': '#61DAFB',
  python: '#3776AB',
  java: '#f89820',
  c: '#A8B9CC',
  'c++': '#00599C',
  cpp: '#00599C',
  html: '#E34F26',
  html5: '#E34F26',
  css: '#1572B6',
  css3: '#1572B6',
  tailwind: '#38BDF8',
  'tailwind css': '#38BDF8',
  nodejs: '#339933',
  'node.js': '#339933',
  express: '#ffffff',
  'express.js': '#ffffff',
  mongodb: '#47A248',
  mysql: '#00758F',
  postgresql: '#336791',
  git: '#F05032',
  github: '#ffffff',
  postman: '#FF6C37',
  docker: '#2496ED',
  'rest apis': '#fbbf24',
  'rest api development': '#fbbf24',
  'data structures': '#ffffff',
  'data structures & algorithms': '#ffffff',
  'responsive ui': '#38BDF8',
  'responsive ui development': '#38BDF8'
};

const getSkillBrandColor = (name, logoKey) => {
  const n = (name || '').toLowerCase().trim();
  const k = (logoKey || '').toLowerCase().trim();
  if (SKILL_BRAND_COLORS[n]) return SKILL_BRAND_COLORS[n];
  if (SKILL_BRAND_COLORS[k]) return SKILL_BRAND_COLORS[k];
  for (const [key, color] of Object.entries(SKILL_BRAND_COLORS)) {
    if (n.includes(key) || key.includes(n)) return color;
  }
  return '#fcd34d';
};

  // Extract real skills dynamically from Admin CMS categories (honoring isVisible & custom icons)
  const allSkills = useMemo(() => {
    const rawSkills = appState?.skills || [];
    const list = [];

    if (Array.isArray(rawSkills) && rawSkills.length > 0) {
      rawSkills.forEach((catGroup) => {
        if (catGroup && Array.isArray(catGroup.items)) {
          const categoryName = (catGroup.category || 'tools').toLowerCase();
          let catKey = 'tools';
          if (categoryName.includes('lang') || categoryName.includes('problem')) catKey = 'languages';
          else if (categoryName.includes('front') || categoryName.includes('ui')) catKey = 'frontend';
          else if (categoryName.includes('back') || categoryName.includes('api') || categoryName.includes('server')) catKey = 'backend';
          else if (categoryName.includes('data') || categoryName.includes('sql') || categoryName.includes('db')) catKey = 'databases';
          else if (categoryName.includes('tool') || categoryName.includes('devops') || categoryName.includes('workflow')) catKey = 'tools';

          catGroup.items.forEach((item) => {
            if (item && item.isVisible !== false) {
              const name = item.name || '';
              list.push({
                id: item.id || name,
                name: name,
                category: catKey,
                categoryName: catGroup.category || 'Tools',
                icon: item.icon,
                logoKey: item.logoKey,
                color: item.color || getSkillBrandColor(name, item.logoKey)
              });
            }
          });
        }
      });
    }

    if (list.length > 0) {
      return list;
    }

    return REFERENCE_SKILLS;
  }, [appState?.skills]);

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: allSkills.length, languages: 0, frontend: 0, backend: 0, databases: 0, tools: 0 };
    allSkills.forEach((s) => {
      const cat = (s.category || '').toLowerCase();
      if (cat === 'languages' || cat.includes('lang')) counts.languages++;
      else if (cat === 'frontend') counts.frontend++;
      else if (cat === 'backend') counts.backend++;
      else if (cat === 'databases' || cat.includes('data') || cat.includes('sql')) counts.databases++;
      else counts.tools++;
    });
    return counts;
  }, [allSkills]);

  const filterOptions = [
    { id: 'all', label: 'All', count: categoryCounts.all },
    { id: 'languages', label: 'Languages', count: categoryCounts.languages },
    { id: 'frontend', label: 'Frontend', count: categoryCounts.frontend },
    { id: 'backend', label: 'Backend', count: categoryCounts.backend },
    { id: 'databases', label: 'Databases', count: categoryCounts.databases },
    { id: 'tools', label: 'Tools', count: categoryCounts.tools }
  ];

  // Live filter & search
  const filteredSkills = useMemo(() => {
    return allSkills.filter((s) => {
      if (selectedFilter !== 'all') {
        const cat = (s.category || '').toLowerCase();
        if (selectedFilter === 'databases') {
          if (cat !== 'databases' && !cat.includes('data') && !cat.includes('sql') && !cat.includes('db')) return false;
        } else if (selectedFilter === 'languages') {
          if (cat !== 'languages' && !cat.includes('lang')) return false;
        } else if (cat !== selectedFilter && !cat.includes(selectedFilter)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const n = (s.name || '').toLowerCase();
        return n.includes(q);
      }
      return true;
    });
  }, [selectedFilter, searchQuery, allSkills]);

  // Smooth entrance animation with guarantee that elements remain visible
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('.skill-card');
    if (!cards || cards.length === 0) return;

    gsap.killTweensOf(cards);

    const animateIn = () => {
      gsap.from(cards, {
        opacity: 0,
        y: 16,
        scale: 0.95,
        duration: 0.4,
        stagger: 0.02,
        ease: 'power2.out',
        clearProps: 'opacity,transform'
      });
    };

    if (isStandalonePage) {
      animateIn();
    } else {
      let triggered = false;
      try {
        gsap.registerPlugin(ScrollTrigger);
        const st = ScrollTrigger.create({
          trigger: gridRef.current,
          start: 'top 92%',
          once: true,
          onEnter: () => {
            if (!triggered) {
              triggered = true;
              animateIn();
            }
          }
        });

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !triggered) {
                triggered = true;
                animateIn();
                observer.disconnect();
              }
            });
          },
          { threshold: 0.1 }
        );

        observer.observe(gridRef.current);

        return () => {
          st.kill();
          observer.disconnect();
        };
      } catch (_e) {
        animateIn();
      }
    }
  }, [selectedFilter, searchQuery, isStandalonePage, filteredSkills.length]);

  return (
    <div className={`skills-section ${isStandalonePage ? 'standalone' : 'home-embedded'}`}>
      {/* Home Header - Only displayed when embedded on Home Page */}
      {!isStandalonePage && (
        <div className="showcase-header mb-8">
          <div>
            <ScrollWriteText
              as="p"
              className="showcase-eyebrow"
              mode="scramble"
              scrambleDuration={20}
            >
              {(ui.homeSkillsEyebrow || '02 · TECHNICAL CAPABILITIES').replace(/^03\b/, '02')}
            </ScrollWriteText>
            <ScrollWriteText
              as="h2"
              className="showcase-title"
              mode="mask"
              stagger={0.038}
              highlightWords={['Skills', 'Tech Stack']}
            >
              Interactive Skills & Tech Stack
            </ScrollWriteText>
          </div>

          <div className="showcase-controls">
            {showCta && onCtaClick && (
              <button
                type="button"
                onClick={() => {
                  playTick('click');
                  onCtaClick();
                }}
                className="showcase-view-all"
              >
                <span>View Full Skills Directory ({allSkills.length})</span>
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '12px' }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Controls Area: Filter Scroll + Rounded Search Pill */}
      <div className="skills-controls-area">
        <div className="filter-scroll">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`filter-btn ${selectedFilter === opt.id ? 'active' : ''}`}
              onClick={() => {
                playTick('click');
                setSelectedFilter(opt.id);
              }}
            >
              <span>{opt.label}</span>
              <span className="count">{opt.count}</span>
            </button>
          ))}
        </div>

        <div className="skills-search-wrapper">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            className="skills-search-input"
            placeholder="Search stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Skills Grid: Sleek Inline Horizontal Chips with Guaranteed Inline SVGs */}
      <div className="skills-grid" ref={gridRef}>
        {filteredSkills.length === 0 ? (
          <div className="skills-empty-state">
            No technologies found matching &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          filteredSkills.map((skill, index) => (
            <SkillChipItem
              key={skill.name || index}
              skill={skill}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Inline Chip Component with 34x34 Circular Lens Pod & 3D Tilt Physics
function SkillChipItem({ skill }) {
  const color = skill.color || '#fcd34d';

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    const tiltX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const tiltY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px) scale(1.035)`;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = '';
  };

  // Render high-contrast, crystal-clear icons (supporting Admin images, SVGs, and font icons)
  const renderIcon = () => {
    // 1. If admin provided an image URL (http, /, data:)
    if (typeof skill.icon === 'string' && (skill.icon.startsWith('http') || skill.icon.startsWith('/') || skill.icon.startsWith('data:'))) {
      return <img src={skill.icon} alt={skill.name} className="w-[18px] h-[18px] object-contain" />;
    }

    const key = getSkillKeyFromItem(skill) || skill.logoKey || skill.iconKey;
    const lowerName = (skill.name || '').toLowerCase().trim();

    // 2. High-contrast vector icons (guarantees white Octocat for GitHub, white EX for Express, real C++, real DSA tree, vibrant MySQL, etc.)
    if (key && SKILL_SVGS[key]) {
      return SKILL_SVGS[key];
    }

    // 3. If admin specified an icon class (Devicon or FontAwesome)
    if (typeof skill.icon === 'string' && skill.icon.trim()) {
      let iconClass = skill.icon.trim();
      if ((lowerName.includes('c++') || lowerName === 'cpp') && iconClass === 'devicon-c-plain') {
        iconClass = 'devicon-cplusplus-plain';
      }
      if (iconClass.includes('devicon-') && !iconClass.includes('colored')) {
        iconClass = `${iconClass} colored`;
      }
      return <i className={`${iconClass} text-[19px] leading-none`} aria-hidden="true" />;
    }

    // 4. Fallback to TechLogo component
    return <TechLogo name={skill.name} className="w-[18px] h-[18px]" />;
  };

  return (
    <div
      className="skill-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--brand-color': color,
        '--icon-color': color
      }}
    >
      <div className="icon-container skill-icon-wrapper">
        {renderIcon()}
      </div>
      <div className="skill-text">
        <span className="skill-name">{skill.name}</span>
      </div>
    </div>
  );
}

export const InteractiveSkillsWidget = SkillsSection;
export default SkillsSection;
