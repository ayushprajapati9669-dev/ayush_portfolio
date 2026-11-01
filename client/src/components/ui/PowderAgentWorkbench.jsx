import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { playTick } from '../../utils/audio';

export function PowderAgentWorkbench({ onOpenTerminal, onOpenResume }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('new');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    { label: 'Explore Flagship Projects', action: () => navigate('/projects') },
    { label: 'Review Full Tech Stack', action: () => navigate('/skills') },
    { label: 'Inspect Verified Certificates', action: () => navigate('/certificates') },
    { label: 'SISTec Academic Highlights (8.42 CGPA)', action: () => navigate('/about') },
    {
      label: 'Open Developer Terminal (Ctrl+~)',
      action: () => {
        if (onOpenTerminal) onOpenTerminal();
        else window.dispatchEvent(new CustomEvent('ams-open-terminal'));
      }
    },
    { label: 'Start a Project Conversation', action: () => navigate('/contact') }
  ];

  const recentSessions = [
    { id: '1', title: 'MERN Architecture & Scaling', time: '2 min ago' },
    { id: '2', title: 'REST API Latency Optimization', time: '1h ago' },
    { id: '3', title: 'MongoDB Indexing Strategy', time: '3h ago' },
    { id: '4', title: 'Scrypt Password Hashing & Auth', time: 'yesterday' },
    { id: '5', title: 'WebGL GLSL Wave Shaders', time: '2d ago' }
  ];

  const handleSendPrompt = async (textToSend) => {
    const prompt = (textToSend || query).trim();
    if (!prompt) return;

    playTick('click');
    setQuery('');

    // Append user message
    const userMsg = { id: Date.now(), sender: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Query backend AI or intelligent knowledge base
      const res = await fetch('/api/public/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });

      if (res.ok) {
        const data = await res.json();
        const replyText =
          data.reply ||
          data.message ||
          "I am Ayush's autonomous portfolio assistant. Ayush is a MERN Stack Software Engineer specializing in scalable React frontends, robust Node.js/Express backends, and MongoDB architectures.";
        setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'agent', text: replyText }]);
      } else {
        throw new Error('Fallback response');
      }
    } catch {
      // Dynamic intelligent response fallback
      let fallbackReply = `Here is what you should know about "${prompt}": Ayush specializes in end-to-end full-stack development with React, Node.js, Express, and MongoDB. He maintains an 8.42 CGPA in Computer Science at SISTec, Bhopal, and has built flagship live projects including full-featured architectural clones and AI workspaces.`;
      
      const lower = prompt.toLowerCase();
      if (lower.includes('project') || lower.includes('airbnb')) {
        fallbackReply = 'Ayush has engineered multiple flagship full-stack applications including full-stack Airbnb clones with secure booking engines, state management, and cloud image pipelines. Visit the Projects tab to inspect live demos.';
      } else if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack')) {
        fallbackReply = 'Ayush’s core technical stack includes React.js, Node.js, Express.js, MongoDB, JavaScript (ES6+), TypeScript, C++, Python, Three.js, GSAP, and Docker.';
      } else if (lower.includes('contact') || lower.includes('hire') || lower.includes('email')) {
        fallbackReply = 'You can reach Ayush directly at ayushprajapati9669@gmail.com or call (+91) 9669802554. He is open for full-time software engineering roles and high-impact internships.';
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'agent', text: fallbackReply }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-white/[0.08] bg-[#0c0c0f]/95 shadow-[0_30px_100px_rgba(0,0,0,0.85)] overflow-hidden backdrop-blur-2xl">
      {/* Top Application Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.06] bg-[#08080a]/80">
        <div className="flex items-center gap-3">
          {/* Powder App Monogram */}
          <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-sm bg-white rotate-45" />
          </div>
          <span className="font-display text-sm font-semibold text-white tracking-tight">
            Ayush Workbench
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
            v2.4 Live Agent
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <button
            type="button"
            onClick={() => setMessages([])}
            className="p-1.5 hover:text-white transition-colors"
            title="Clear Chat"
          >
            <i className="fa-solid fa-rotate-right text-xs" />
          </button>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>
      </div>

      {/* Main Split Window */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
        {/* Left Mini Sidebar */}
        <div className="hidden md:flex md:col-span-4 border-r border-white/[0.06] bg-[#08080a]/60 p-4 flex-col justify-between">
          <div className="space-y-4">
            {/* New Chat Button */}
            <button
              type="button"
              onClick={() => {
                playTick('click');
                setMessages([]);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-white text-xs font-semibold transition-all active:scale-[0.98]"
            >
              <span>+ New Session</span>
              <kbd className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">⌘N</kbd>
            </button>

            {/* Recents list */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 px-1">
                Recent Threads
              </span>
              <div className="space-y-1 pt-1">
                {recentSessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSendPrompt(`Tell me about your experience with ${s.title}`)}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{s.title}</span>
                    <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-500 shrink-0">
                      {s.time}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Card at bottom */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-display text-xs font-bold text-white">
              AP
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">Ayush Prajapati</span>
              <span className="text-[10px] font-mono text-emerald-400 truncate">Software Engineer</span>
            </div>
          </div>
        </div>

        {/* Center Main Agent Chat Area */}
        <div className="col-span-1 md:col-span-8 p-6 flex flex-col justify-between bg-[#0a0a0d]/40">
          {messages.length === 0 ? (
            /* Empty State: Powder "What do you want to do?" */
            <div className="flex-1 flex flex-col justify-center items-center text-center max-w-xl mx-auto py-6 space-y-6">
              <div className="space-y-2">
                <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  What do you want to explore?
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Ask anything about Ayush's engineering experience, architectures, and full-stack projects.
                </p>
              </div>

              {/* 6 Quick Action Recommendation Pills (from Image 2/5) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2">
                {quickPrompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      playTick('click');
                      p.action();
                    }}
                    className="px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-[#121215]/80 hover:bg-white/[0.08] hover:border-white/20 text-xs font-medium text-zinc-200 text-left transition-all flex items-center justify-between group active:scale-[0.98]"
                  >
                    <span className="truncate pr-2">{p.label}</span>
                    <i className="fa-solid fa-arrow-right text-[10px] text-zinc-500 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Live Message Stream */
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] pr-2 custom-scroll">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-white text-black font-medium'
                        : 'bg-[#15151a] border border-white/10 text-zinc-200'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#15151a] border border-white/10 rounded-2xl px-4 py-3 text-xs text-zinc-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Input Prompt Bar (from Image 2/5) */}
          <div className="pt-4">
            <div className="relative rounded-2xl border border-white/[0.12] bg-[#111115] focus-within:border-white/30 focus-within:shadow-[0_0_25px_rgba(255,255,255,0.06)] transition-all">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything. Type / for shortcuts or explore projects..."
                className="w-full bg-transparent px-4 py-3.5 pr-24 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
              />

              {/* Action Buttons Inside Input */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSendPrompt()}
                  disabled={!query.trim()}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    query.trim()
                      ? 'bg-white text-black hover:bg-zinc-200 active:scale-95'
                      : 'bg-white/5 text-zinc-600'
                  }`}
                  aria-label="Send query"
                >
                  <i className="fa-solid fa-arrow-up text-xs" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
