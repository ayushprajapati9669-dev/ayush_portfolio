import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TiltCard } from './TiltCard';

export function PowderFeatureCards() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: 'shared-context',
      badge: 'Architecture',
      title: 'Shared Context & Architecture',
      desc: 'Bring frontend, APIs, databases, and telemetry into a single unified, ultra-low-latency engineering stack.',
      tags: ['React 18', 'Node.js', 'MongoDB', 'REST APIs'],
      illustration: (
        <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Subtle isometric grid floor */}
          <path d="M40 180 L160 215 L280 180 L160 145 Z" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
          <path d="M70 160 L160 185 L250 160 L160 135 Z" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
          
          {/* Card 3 (Back) */}
          <g transform="translate(140, 20)">
            <polygon points="0,40 70,0 70,100 0,140" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
            <polygon points="70,0 120,25 120,125 70,100" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
            <circle cx="95" cy="65" r="14" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <path d="M85 65 L105 65 M95 55 L95 75" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <ellipse cx="95" cy="65" rx="14" ry="6" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
          </g>

          {/* Card 2 (Middle) */}
          <g transform="translate(90, 45)">
            <polygon points="0,40 70,0 70,100 0,140" fill="rgba(15,15,18,0.9)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" />
            <polygon points="70,0 120,25 120,125 70,100" fill="rgba(25,25,30,0.9)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" />
            {/* Play symbol */}
            <polygon points="88,58 88,72 102,65" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none" />
            <line x1="20" y1="95" x2="60" y2="75" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
            <line x1="20" y1="110" x2="50" y2="95" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
          </g>

          {/* Card 1 (Front Active) */}
          <g transform="translate(40, 70)">
            <polygon points="0,40 70,0 70,100 0,140" fill="rgba(18,18,24,0.95)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" />
            <polygon points="70,0 120,25 120,125 70,100" fill="rgba(30,30,38,0.95)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" />
            {/* Document icon */}
            <rect x="85" y="55" width="20" height="26" rx="2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none" />
            <line x1="90" y1="63" x2="100" y2="63" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            <line x1="90" y1="69" x2="98" y2="69" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            {/* Front lines */}
            <line x1="16" y1="80" x2="55" y2="60" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" />
            <line x1="16" y1="95" x2="45" y2="80" stroke="rgba(255,255,255,0.25)" strokeWidth="1.4" />
          </g>
        </svg>
      )
    },
    {
      id: 'trusted-answers',
      badge: 'Intelligence',
      title: 'Trusted Intelligence & AI',
      desc: 'Build conversational AI interfaces, custom WebGL GLSL shaders, and intelligent background automations.',
      tags: ['Three.js', 'GLSL', 'Framer Motion', 'Web Audio'],
      illustration: (
        <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Isometric Pedestal Base */}
          <g transform="translate(85, 90)">
            <polygon points="75,0 150,40 75,80 0,40" fill="rgba(20,20,26,0.95)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.4" />
            <polygon points="0,40 75,80 75,115 0,75" fill="rgba(14,14,18,0.95)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.4" />
            <polygon points="75,80 150,40 150,75 75,115" fill="rgba(26,26,34,0.95)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.4" />

            {/* Pedestal Top Core Indentation */}
            <ellipse cx="75" cy="40" rx="35" ry="18" fill="rgba(5,5,8,0.9)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <line x1="45" y1="75" x2="65" y2="75" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          </g>

          {/* Floating Glowing Diamond Spark / AI Core */}
          <g transform="translate(130, 20)">
            <motion.g
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Outer Glow Halo */}
              <circle cx="30" cy="50" r="32" fill="url(#coreGlow)" opacity="0.25" />
              {/* Diamond 4-Point Star Core */}
              <path
                d="M30 18 Q30 50 62 50 Q30 50 30 82 Q30 50 -2 50 Q30 50 30 18 Z"
                fill="rgba(255,255,255,0.06)"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="1.6"
              />
              <path
                d="M30 30 Q30 50 50 50 Q30 50 30 70 Q30 50 10 50 Q30 50 30 30 Z"
                fill="rgba(255,255,255,0.15)"
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="1.2"
              />
              <circle cx="30" cy="50" r="3.5" fill="#ffffff" />
            </motion.g>
          </g>

          <defs>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'instant-action',
      badge: 'Execution',
      title: 'Instant Production Action',
      desc: 'Ship clean modular architectures with scrypt security, CI/CD pipelines, and zero-compromise runtime speeds.',
      tags: ['Docker', 'Git CI/CD', 'Automated Tests', 'Linux'],
      illustration: (
        <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Isometric Precision Play Dial / Token */}
          <g transform="translate(100, 30)">
            {/* Outer Ring Extrusion */}
            <path
              d="M120 70 C120 105 95 130 60 130 C25 130 0 105 0 70 L0 90 C0 125 25 150 60 150 C95 150 120 125 120 90 Z"
              fill="rgba(14,14,18,0.95)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.4"
            />
            {/* Ring Top Face */}
            <ellipse cx="60" cy="70" rx="60" ry="32" fill="rgba(22,22,28,0.95)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" />
            
            {/* Inner Ring Recess */}
            <path
              d="M100 70 C100 92 82 110 60 110 C38 110 20 92 20 70 L20 82 C20 104 38 122 60 122 C82 122 100 104 100 82 Z"
              fill="rgba(8,8,12,0.95)"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.2"
            />
            <ellipse cx="60" cy="70" rx="40" ry="22" fill="rgba(12,12,16,0.95)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />

            {/* Center Play Triangle Symbol */}
            <polygon
              points="55,60 55,80 73,70"
              fill="rgba(255,255,255,0.12)"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1.6"
            />

            {/* Orbiting Tech Particles */}
            <circle cx="108" cy="70" r="3" fill="#22c55e" />
            <circle cx="12" cy="70" r="2.5" fill="rgba(255,255,255,0.6)" />
          </g>
        </svg>
      )
    }
  ];

  const handlePrev = () => {
    setActiveTab((prev) => (prev > 0 ? prev - 1 : features.length - 1));
  };

  const handleNext = () => {
    setActiveTab((prev) => (prev < features.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="space-y-10 border-t border-white/[0.08] pt-20">
      {/* Top Header Row with Powder Badge */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 max-w-2xl">
          {/* Powder Pill Badge with Live Dot */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#121215] px-3.5 py-1 text-xs font-mono text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Why Ayush</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
            One engineer for answers, actions, and momentum.
          </h2>
        </div>

        <p className="text-zinc-400 text-sm sm:text-base max-w-md leading-relaxed lg:pb-1">
          Bringing full-stack systems, modern AI workflows, and rock-solid code execution into a single unified engineering interface.
        </p>
      </div>

      {/* 3 Isometric Wireframe Feature Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <TiltCard
              key={item.id}
              maxTilt={6}
              className={`rounded-2xl border transition-all duration-300 ${
                activeTab === idx
                  ? 'border-white/25 bg-[#101014] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(255,255,255,0.03)]'
                  : 'border-white/[0.08] bg-[#0c0c0f] hover:border-white/15'
              } p-6 flex flex-col justify-between h-[420px] group cursor-pointer`}
              onClick={() => setActiveTab(idx)}
            >
              {/* Illustration Canvas Stage */}
              <div className="relative w-full h-[220px] rounded-xl bg-[#08080a] border border-white/[0.04] overflow-hidden flex items-center justify-center group-hover:border-white/10 transition-colors">
                {item.illustration}
                
                {/* Corner Tag */}
                <span className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-md">
                  {item.badge}
                </span>
              </div>

              {/* Bottom Text Content */}
              <div className="space-y-2 pt-4">
                <h3 className="font-display text-lg font-bold text-white group-hover:text-zinc-100 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>

                {/* Micro tech pills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* Minimal Progress Slider & Controls (from Image 1/4) */}
        <div className="flex items-center justify-between pt-8 max-w-md mx-auto">
          <button
            type="button"
            onClick={handlePrev}
            className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all active:scale-95"
            aria-label="Previous feature"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
          </button>

          {/* Progress Bar Track */}
          <div className="flex-1 mx-6 h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              animate={{
                width: `${((activeTab + 1) / features.length) * 100}%`
              }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            />
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all active:scale-95"
            aria-label="Next feature"
          >
            <i className="fa-solid fa-arrow-right text-xs" />
          </button>
        </div>
      </div>
    </section>
  );
}

