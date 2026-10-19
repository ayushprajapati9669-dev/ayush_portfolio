import React from 'react';

export function SocialBrandIcon({ platform, className = 'h-5 w-5' }) {
  const p = String(platform || '').toLowerCase();
  if (p === 'github') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }
  if (p === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    );
  }
  if (p === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  if (p === 'leetcode') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .666-1.795l3.854-4.126 5.406-5.788a1.374 1.374 0 0 0-.97-2.327zM20.25 10.426H8.5a1.375 1.375 0 1 0 0 2.75h11.75a1.375 1.375 0 1 0 0-2.75z" />
      </svg>
    );
  }
  return null;
}

export function SocialIconButtons({ socialLinks, sizeClass = 'h-11 w-11', iconClass = null }) {
  if (!socialLinks) return null;
  const isLarge = sizeClass.includes('14') || sizeClass.includes('16');
  const isMedium = sizeClass.includes('12') || sizeClass.includes('11');
  const icClass = iconClass || (isLarge ? 'h-6 w-6' : isMedium ? 'h-5 w-5' : 'h-4 w-4');

  return (
    <>
      {socialLinks.github && (
        <a
          href={socialLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
          title="GitHub Profile"
          className={`focus-ring inline-flex ${sizeClass} items-center justify-center rounded-2xl border border-white/15 bg-charcoal/90 text-alabaster shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-alabaster/60 hover:bg-white hover:text-obsidian hover:shadow-lg`}
        >
          <SocialBrandIcon platform="github" className={icClass} />
        </a>
      )}
      {socialLinks.linkedin && (
        <a
          href={socialLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn Profile"
          title="LinkedIn Profile"
          className={`focus-ring inline-flex ${sizeClass} items-center justify-center rounded-2xl border border-white/15 bg-charcoal/90 text-[#0A66C2] shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white hover:shadow-lg hover:shadow-[#0A66C2]/20`}
        >
          <SocialBrandIcon platform="linkedin" className={icClass} />
        </a>
      )}
      {socialLinks.instagram && (
        <a
          href={socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram Profile"
          title="Instagram Profile"
          className={`focus-ring inline-flex ${sizeClass} items-center justify-center rounded-2xl border border-white/15 bg-charcoal/90 text-[#E1306C] shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-[#E1306C] hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white hover:shadow-lg hover:shadow-[#DD2A7B]/25`}
        >
          <SocialBrandIcon platform="instagram" className={icClass} />
        </a>
      )}
      {socialLinks.leetcode && (
        <a
          href={socialLinks.leetcode}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LeetCode Profile"
          title="LeetCode Profile"
          className={`focus-ring inline-flex ${sizeClass} items-center justify-center rounded-2xl border border-white/15 bg-charcoal/90 text-[#FFA116] shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-[#FFA116] hover:bg-[#FFA116] hover:text-obsidian hover:shadow-lg hover:shadow-[#FFA116]/20`}
        >
          <SocialBrandIcon platform="leetcode" className={icClass} />
        </a>
      )}
    </>
  );
}

export function SkillCategoryTabIcon({ tabIconKey, isActive }) {
  const strokeColor = isActive ? '#00D4FF' : '#6366F1';
  const k = String(tabIconKey || '').toLowerCase();
  if (k === 'languages') {
    return (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16a2 2 0 012 2v9a2 2 0 01-2 2h-5l-4 4v-4H4a2 2 0 01-2-2V7a2 2 0 012-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 9.5L7 11.5l2.5 2m5-4l2.5 2-2.5 2m-1.5-5l-2 6" />
      </svg>
    );
  }
  if (k === 'frontend') {
    return (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8">
        <rect x="3" y="4" width="16" height="14" rx="2" />
        <path strokeLinecap="round" d="M3 8h16M6 6h.01M9 6h.01" />
        <circle cx="17.5" cy="16.5" r="3" fill="#0B1528" stroke={strokeColor} strokeWidth="1.8" />
        <path strokeLinecap="round" d="M17.5 12.5v1m0 6v1m-4-4h1m6 0h1" />
      </svg>
    );
  }
  if (k === 'backend') {
    return (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8">
        <rect x="3" y="4" width="16" height="13" rx="2" />
        <path strokeLinecap="round" d="M3 8h16M6 6h.01M9 6h.01" />
        <circle cx="12" cy="13" r="2" />
        <circle cx="17.5" cy="17.5" r="2.5" fill="#0B1528" stroke={strokeColor} strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function getSkillIconBgTint(keyOrName) {
  const k = String(keyOrName || '').toLowerCase();
  if (k.includes('react') || k.includes('tailwind')) return 'bg-[#0E2A38] border-[#00D4FF]/20';
  if (k.includes('vite') || k.includes('bootstrap')) return 'bg-[#211A3A] border-[#8B5CF6]/25';
  if (k.includes('css') || k.includes('mysql') || k.includes('python') || k === 'c') return 'bg-[#122338] border-[#38BDF8]/20';
  if (k.includes('html') || k.includes('git') || k.includes('postman') || (k.includes('java') && !k.includes('javascript'))) return 'bg-[#2C1B1E] border-[#FF6B4A]/25';
  if (k.includes('javascript') || k === 'js') return 'bg-[#2B2818] border-[#F7DF1E]/25';
  if (k.includes('node') || k.includes('mongo')) return 'bg-[#132A20] border-[#10B981]/25';
  return 'bg-[#161B2A] border-white/10';
}

export function TechLogo({ name, className = 'h-5 w-5' }) {
  const k = String(name || '').toLowerCase();
  if (k.includes('react')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="2.2" fill="#61DAFB" />
        <ellipse cx="12" cy="12" rx="10" ry="4.3" stroke="#61DAFB" strokeWidth="1.6" />
        <ellipse cx="12" cy="12" rx="10" ry="4.3" transform="rotate(60 12 12)" stroke="#61DAFB" strokeWidth="1.6" />
        <ellipse cx="12" cy="12" rx="10" ry="4.3" transform="rotate(120 12 12)" stroke="#61DAFB" strokeWidth="1.6" />
      </svg>
    );
  }
  if (k.includes('vite')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none" aria-hidden="true">
        <path d="M21.5 3.5L12.3 21.5c-.3.5-1 .5-1.3 0L2.5 3.5c-.3-.5.2-1.1.8-.9l8.7 2.4 8.7-2.4c.6-.2 1.1.4.8.9z" fill="#646CFF" />
        <path d="M15.8 2.5L9.2 12.2h3.6l-1.5 6.8 6.8-9.8h-3.6l1.3-6.7z" fill="#FFEA83" />
      </svg>
    );
  }
  if (k.includes('tailwind')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#38BDF8" aria-hidden="true">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
      </svg>
    );
  }
  if (k.includes('bootstrap')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#8B5CF6" aria-hidden="true">
        <rect x="2" y="3" width="20" height="18" rx="4" fill="#7952B3" />
        <path d="M8.5 7.5h4.2c1.6 0 2.6.8 2.6 2.1 0 .9-.6 1.6-1.4 1.9 1.1.2 1.8 1 1.8 2.2 0 1.6-1.2 2.5-3.1 2.5H8.5V7.5zm2.1 3.4h1.7c.7 0 1.2-.4 1.2-1s-.5-1-1.2-1h-1.7v2zm0 3.7h2c.8 0 1.3-.4 1.3-1.1 0-.7-.5-1.1-1.3-1.1h-2v2.2z" fill="#FFF" />
      </svg>
    );
  }
  if (k.includes('next')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#000000" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
        <path d="M8.5 16V8l7.8 9.8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M15.5 8v5.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (k.includes('javascript') || k === 'js') {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} aria-hidden="true">
        <rect width="24" height="24" rx="4" fill="#F7DF1E" />
        <path d="M6.7 19.2c.4.7 1 1.2 2.1 1.2 1.1 0 1.8-.5 1.8-1.8v-6.9h2.1v7c0 2.4-1.4 3.5-3.6 3.5-1.9 0-3-.9-3.6-2.1l1.2-.9zm7.9-.2c.5.8 1.2 1.4 2.4 1.4 1 0 1.7-.5 1.7-1.2 0-.8-.7-1.1-1.8-1.6l-.6-.3c-1.8-.8-3-1.7-3-3.7 0-1.8 1.4-3.2 3.6-3.2 1.6 0 2.7.5 3.5 1.9l-1.9 1.2c-.4-.7-.9-1-1.6-1-.7 0-1.2.5-1.2 1 0 .7.5 1 1.6 1.5l.6.3c2.1.9 3.3 1.8 3.3 3.9 0 2.2-1.8 3.4-4.1 3.4-2.3 0-3.8-1.1-4.5-2.5l2-1.1z" fill="#090A0F" />
      </svg>
    );
  }
  if (k.includes('node')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#5FA04E" aria-hidden="true">
        <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l7.44 4.3c.48.28 1.08.28 1.56 0l7.44-4.3c.48-.28.78-.8.78-1.36V7.71c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.51-.2-.78-.2zm0 2.2l6.6 3.8v7.6L12 19.25l-6.6-3.8v-7.6L12 4.05z" />
      </svg>
    );
  }
  if (k.includes('express')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#F8FAFC" aria-hidden="true">
        <path d="M24 18.588a1.529 1.529 0 01-1.895-.72l-3.45-4.771-.5-.667-4.003 5.444a1.466 1.466 0 01-1.802.708l5.158-6.92-4.798-6.251a1.595 1.595 0 011.9.666l3.576 4.83 3.596-4.81a1.435 1.435 0 011.788-.668L21.708 7.9l-2.522 3.283a.666.666 0 000 .994l4.814 6.412zM.002 11.576l.42-2.075c1.154-4.103 5.858-5.81 9.094-3.27 1.895 1.489 2.368 3.597 2.275 5.973H1.116C.943 16.447 4.005 19.009 7.92 17.7a4.078 4.078 0 002.582-2.876c.207-.666.548-.78 1.174-.56-.541 2.736-2.437 4.497-5.387 4.783-3.516.34-6.298-1.922-6.287-5.471v-2zm10.57-1.153c-.082-2.616-1.908-4.39-4.53-4.39-2.548 0-4.568 1.694-4.888 4.39h9.418z" />
      </svg>
    );
  }
  if (k.includes('mongo')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#47A248" aria-hidden="true">
        <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z" />
      </svg>
    );
  }
  if (k.includes('mysql') || k.includes('sql')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#38BDF8" aria-hidden="true">
        <path d="M12 3C6.5 3 2 4.79 2 7v10c0 2.21 4.5 4 10 4s10-1.79 10-4V7c0-2.21-4.5-4-10-4zm0 2c4.42 0 8 1.12 8 2.5S16.42 10 12 10 4 8.88 4 7.5 7.58 5 12 5zm8 12c0 1.38-3.58 2.5-8 2.5S4 18.38 4 17v-2.16c1.82 1.03 4.73 1.66 8 1.66s6.18-.63 8-1.66V17zm0-5c0 1.38-3.58 2.5-8 2.5S4 13.38 4 12V9.84c1.82 1.03 4.73 1.66 8 1.66s6.18-.63 8-1.66V12z" />
      </svg>
    );
  }
  if (k.includes('python')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#3776AB" aria-hidden="true">
        <path d="M11.88 2c-5.05 0-4.73 2.19-4.73 2.19l.01 2.27h4.82v.68H5.25S2 6.77 2 11.84c0 5.07 2.83 4.89 2.83 4.89h1.69v-2.35s-.09-2.83 2.78-2.83h4.79s2.69.04 2.69-2.6V4.61S17.18 2 11.88 2zm-2.66 1.54c.48 0 .87.39.87.87 0 .48-.39.87-.87.87-.48 0-.87-.39-.87-.87 0-.48.39-.87.87-.87zm2.9 18.46c5.05 0 4.73-2.19 4.73-2.19l-.01-2.27h-4.82v-.68h6.73S22 17.23 22 12.16c0-5.07-2.83-4.89-2.83-4.89h-1.69v2.35s.09 2.83-2.78 2.83H9.91s-2.69-.04-2.69 2.6v4.34S6.82 22 12.12 22zm2.66-1.54c-.48 0-.87-.39-.87-.87 0-.48.39-.87.87-.87.48 0 .87.39.87.87 0 .48-.39.87-.87.87z" />
      </svg>
    );
  }
  if (k.includes('java')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#ED8B00" aria-hidden="true">
        <path d="M8.85 18.56s-.92.53.65.71c1.9.22 2.87.19 4.96-.21 0 0 .55.34 1.32.64-4.7 2.01-10.63-.12-6.93-1.14zm-.57-2.63s-1.03.76.54.92c2.04.21 3.65.23 6.44-.31 0 0 .39.39.99.6-5.68 1.66-12.01.13-7.97-1.21zm4.86-4.46c1.16 1.34-.3 2.54-.3 2.54s2.94-1.52 1.59-3.42c-1.26-1.77-2.23-2.65 3.01-5.68 0 0-8.22 2.05-4.3 6.56zm6.23 8.95s.68.56-.75.99c-2.72.82-11.33 1.07-13.72.03-.86-.37.75-.89 1.26-.99.53-.11.83-.09.83-.09-.95-.67-6.17 1.32-2.65 1.89 9.61 1.56 17.53-.7 15.03-1.83z" />
      </svg>
    );
  }
  if (k === 'c') {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#60A5FA" aria-hidden="true">
        <path d="M16.59 9.19s-.38-3.32-3.92-3.42c-3.54-.1-5.34 2.66-5.34 6.13 0 3.47 1.94 6.34 5.43 6.34 3.49 0 3.83-3.52 3.83-3.52l3.37.2s.2 1.83-1.36 3.65c-1.56 1.83-3.71 2.52-6.15 2.52-2.44 0-5.41-.82-7.21-3.17-1.8-2.35-1.99-5.11-1.99-6.22 0-1.11.27-4.3 2.44-6.52C7.54 3.28 10.1 2.9 12.35 2.9c2.25 0 7.12.92 7.62 6.29h-3.38z" />
      </svg>
    );
  }
  if (k.includes('html')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#E34F26" aria-hidden="true">
        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" />
      </svg>
    );
  }
  if (k.includes('css')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#2965F1" aria-hidden="true">
        <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z" />
      </svg>
    );
  }
  if (k.includes('github')) {
    return <SocialBrandIcon platform="github" className={className} />;
  }
  if (k.includes('git')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#F05032" aria-hidden="true">
        <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187" />
      </svg>
    );
  }
  if (k.includes('postman') || k.includes('rest')) {
    return (
      <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#FF6C37" aria-hidden="true">
        <path d="M13.527.099C6.955-.744.942 3.9.099 10.473c-.843 6.572 3.8 12.584 10.373 13.428 6.573.843 12.587-3.801 13.428-10.374C24.744 6.955 20.101.943 13.527.099zm2.471 7.485a.855.855 0 00-.593.25l-4.453 4.453-.307-.307-.643-.643c4.389-4.376 5.18-4.418 5.996-3.753z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="#00D4FF" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5zm0 7.5l-6-3 6-3 6 3-6 3zm0 2.5l-10-5v10l10 5 10-5V7l-10 5z" />
    </svg>
  );
}
