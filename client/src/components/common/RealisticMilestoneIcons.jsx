import React from 'react';

/**
 * Realistic 3D Icon: Milestone Flag & Marker (Total Milestones)
 * Features metallic rim, specular reflections, 3D folded crimson banner, and ambient coral glow.
 */
export function RealisticMilestoneFlagIcon({ size = 42, className = '' }) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="Total Milestones"
    >
      <svg
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(244,63,94,0.45)]"
      >
        <defs>
          {/* Ambient Glow Filter */}
          <filter id="coralGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* 3D Sphere Outer Metallic Rim */}
          <linearGradient id="flagRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fda4af" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#e11d48" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#4c0519" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.6" />
          </linearGradient>

          {/* Inner Dark Glass Sphere */}
          <radialGradient id="flagGlass" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#3f1322" />
            <stop offset="45%" stopColor="#1e0b14" />
            <stop offset="100%" stopColor="#0a0307" />
          </radialGradient>

          {/* Specular Glint Highlight */}
          <linearGradient id="flagGlint" x1="20%" y1="0%" x2="50%" y2="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Metallic Silver Pole */}
          <linearGradient id="poleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="40%" stopColor="#f8fafc" />
            <stop offset="70%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* 3D Crimson-Coral Flag Banner */}
          <linearGradient id="flagBanner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="40%" stopColor="#e11d48" />
            <stop offset="85%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Flag Fold Highlight & Shadow */}
          <linearGradient id="flagFold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#000000" stopOpacity="0.25" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* 3D Glass Sphere Backing */}
        <circle cx="26" cy="26" r="22" fill="url(#flagGlass)" stroke="url(#flagRim)" strokeWidth="1.8" />
        <ellipse cx="26" cy="14" rx="14" ry="7" fill="url(#flagGlint)" />

        {/* Silver Flagpole */}
        <rect x="16.5" y="11" width="2.5" height="29" rx="1.25" fill="url(#poleGrad)" />
        {/* Golden / Silver Ball Finial */}
        <circle cx="17.75" cy="11" r="2.2" fill="#fde047" stroke="#ca8a04" strokeWidth="0.6" />
        <circle cx="17.2" cy="10.2" r="0.7" fill="#ffffff" />

        {/* 3D Waving Flag Banner */}
        <path
          d="M19 13.5 C 24 12, 28 15, 34 13.5 C 36 13, 37 13.2, 38 13.5 L 34.5 20 L 38 26.5 C 35 25.5, 31 27.5, 27 25.5 C 23 24, 21 26, 19 25.2 Z"
          fill="url(#flagBanner)"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
        />
        {/* Flag Fold Overlay */}
        <path
          d="M19 13.5 C 24 12, 28 15, 34 13.5 C 36 13, 37 13.2, 38 13.5 L 34.5 20 L 38 26.5 C 35 25.5, 31 27.5, 27 25.5 C 23 24, 21 26, 19 25.2 Z"
          fill="url(#flagFold)"
          mixBlendMode="overlay"
        />
        {/* Star Accent on Flag */}
        <polygon points="26,17 27.2,19.5 30,19.8 28,21.7 28.5,24.5 26,23.2 23.5,24.5 24,21.7 22,19.8 24.8,19.5" fill="#fef08a" opacity="0.9" />

        {/* Pole Base Stand */}
        <ellipse cx="17.75" cy="40" rx="3.5" ry="1.2" fill="url(#poleGrad)" opacity="0.8" />
      </svg>
    </div>
  );
}

/**
 * Realistic 3D Icon: Emerald Checkmark Shield (Completed Milestones)
 * Features 3D beveled emerald jewel casing with glowing checkmark & specular glint.
 */
export function RealisticCheckmarkIcon({ size = 42, className = '' }) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="Completed Milestones"
    >
      <svg
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(16,185,129,0.45)]"
      >
        <defs>
          <linearGradient id="emeraldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#10b981" />
            <stop offset="80%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.7" />
          </linearGradient>

          <radialGradient id="emeraldGlass" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="50%" stopColor="#022c22" />
            <stop offset="100%" stopColor="#02140e" />
          </radialGradient>

          <linearGradient id="emeraldGlint" x1="20%" y1="0%" x2="50%" y2="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="check3D" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="40%" stopColor="#34d399" />
            <stop offset="80%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* 3D Glass Sphere Backing */}
        <circle cx="26" cy="26" r="22" fill="url(#emeraldGlass)" stroke="url(#emeraldRim)" strokeWidth="1.8" />
        <ellipse cx="26" cy="14" rx="14" ry="7" fill="url(#emeraldGlint)" />

        {/* Inner Jewel Ring */}
        <circle cx="26" cy="26" r="17" stroke="#10b981" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />

        {/* 3D Beveled Emerald Checkmark */}
        <path
          d="M17 26.5 L 23 32.5 L 35 19.5"
          stroke="url(#check3D)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
        />

        {/* Checkmark Specular Highlight line */}
        <path
          d="M18 26.5 L 23 31.5 L 34 20.5"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
      </svg>
    </div>
  );
}

/**
 * Realistic 3D Icon: Holographic Target / Bullseye (Active Focus)
 * Concentric cyan & sapphire rings with central illuminated core & crosshairs.
 */
export function RealisticBullseyeIcon({ size = 42, className = '' }) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="Active Focus"
    >
      <svg
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(56,189,248,0.45)]"
      >
        <defs>
          <linearGradient id="cyanRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#0284c7" />
            <stop offset="80%" stopColor="#082f49" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
          </linearGradient>

          <radialGradient id="cyanGlass" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#082f49" />
            <stop offset="50%" stopColor="#041827" />
            <stop offset="100%" stopColor="#020c14" />
          </radialGradient>

          <linearGradient id="cyanGlint" x1="20%" y1="0%" x2="50%" y2="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="targetCore" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="80%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>
        </defs>

        {/* 3D Glass Sphere Backing */}
        <circle cx="26" cy="26" r="22" fill="url(#cyanGlass)" stroke="url(#cyanRim)" strokeWidth="1.8" />
        <ellipse cx="26" cy="14" rx="14" ry="7" fill="url(#cyanGlint)" />

        {/* Concentric Outer Ring */}
        <circle cx="26" cy="26" r="16" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

        {/* Middle Ring */}
        <circle cx="26" cy="26" r="11" stroke="#38bdf8" strokeWidth="2.2" opacity="0.85" />

        {/* Crosshair Ticks */}
        <line x1="26" y1="9" x2="26" y2="13" stroke="#7dd3fc" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="26" y1="39" x2="26" y2="43" stroke="#7dd3fc" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="9" y1="26" x2="13" y2="26" stroke="#7dd3fc" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="39" y1="26" x2="43" y2="26" stroke="#7dd3fc" strokeWidth="1.8" strokeLinecap="round" />

        {/* Central Glowing Bullseye Orb */}
        <circle cx="26" cy="26" r="5.5" fill="url(#targetCore)" filter="drop-shadow(0 0 6px rgba(56,189,248,0.8))" />
        <circle cx="24.5" cy="24.5" r="1.5" fill="#ffffff" />
      </svg>
    </div>
  );
}

/**
 * Realistic 3D Icon: Golden Academic Mortarboard / Graduation Cap (B.Tech CGPA)
 * Features luxury golden rim, 3D academic mortarboard, golden tassel, and warm amber glow.
 */
export function RealisticGraduationCapIcon({ size = 42, className = '' }) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="B.Tech CGPA & Academic Qualifications"
    >
      <svg
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(245,158,11,0.45)]"
      >
        <defs>
          <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.75" />
          </linearGradient>

          <radialGradient id="goldGlass" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="50%" stopColor="#290e02" />
            <stop offset="100%" stopColor="#120500" />
          </radialGradient>

          <linearGradient id="goldGlint" x1="20%" y1="0%" x2="50%" y2="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* 3D Cap Diamond Surface */}
          <linearGradient id="capTop" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="30%" stopColor="#d97706" />
            <stop offset="70%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* 3D Cap Skull Base */}
          <linearGradient id="capBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Golden Tassel */}
          <linearGradient id="tasselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* 3D Glass Sphere Backing */}
        <circle cx="26" cy="26" r="22" fill="url(#goldGlass)" stroke="url(#goldRim)" strokeWidth="1.8" />
        <ellipse cx="26" cy="14" rx="14" ry="7" fill="url(#goldGlint)" />

        {/* Cap Base / Skull Underneath */}
        <path
          d="M18 24.5 C 18 24.5, 18 31, 26 33.5 C 34 31, 34 24.5, 34 24.5"
          fill="url(#capBase)"
          stroke="#b45309"
          strokeWidth="1.2"
        />

        {/* 3D Cap Diamond Upper Surface */}
        <polygon
          points="26,14.5 39,20.5 26,26.5 13,20.5"
          fill="url(#capTop)"
          stroke="#fde047"
          strokeWidth="1.2"
          strokeLinejoin="round"
          filter="drop-shadow(0 3px 5px rgba(0,0,0,0.6))"
        />

        {/* Specular Highlight on Left Cap Facet */}
        <polygon
          points="26,15.2 26,25.8 13.8,20.5"
          fill="#ffffff"
          opacity="0.22"
        />

        {/* Center Button on Mortarboard */}
        <circle cx="26" cy="20.5" r="1.8" fill="#fef08a" stroke="#d97706" strokeWidth="0.6" />

        {/* Braided Golden Tassel with Ribbon & Fringe */}
        <path
          d="M26 20.5 Q 31 22, 33 27 L 34.5 35"
          stroke="url(#tasselGrad)"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Tassel Hanging Fringe */}
        <rect x="33" y="32" width="3" height="5" rx="1" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
