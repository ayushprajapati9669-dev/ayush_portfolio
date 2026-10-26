import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { playTick } from '../../utils/audio';

const SUGGESTIONS = [
  "What is Ayush's experience with MongoDB indexing?",
  "Show me his hackathon winning project",
  "Is Ayush available for immediate joining?",
  "What are his LeetCode problem solving stats?"
];

export function AskAyushAiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'ai',
      text: "👋 Hi! I'm Ayush's AI Assistant, trained directly on his production codebase, architectures, and achievements. Ask me anything about his technical experience, database decisions, or interview availability!",
      timestamp: 'Just now',
      followUps: SUGGESTIONS
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages]);

  const handleSend = async (queryText) => {
    const q = (queryText || inputVal).trim();
    if (!q || loading) return;

    playTick('click');
    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch('/api/public/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });

      if (res.ok) {
        const data = await res.json();
        playTick('notification');
        setMessages((prev) => [
          ...prev,
          {
            id: 'msg-ai-' + Date.now(),
            sender: 'ai',
            text: data.answer || "I found relevant details in Ayush's portfolio context.",
            followUps: data.followUps || [],
            relatedProject: data.relatedProject || null,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error('Response error');
      }
    } catch (_err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-err-' + Date.now(),
          sender: 'ai',
          text: "Ayush is specialized in Full-Stack MERN and distributed backend microservices with Redis and MongoDB. Feel free to explore his Projects or use the Contact form!",
          followUps: ["Is Ayush available for immediate joining?", "What is his primary tech stack?"],
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[990] flex items-center gap-3">
          <button
            onClick={() => {
              playTick('click');
              setIsOpen(true);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#080e1a]/90 hover:bg-[#0c1526] border border-cyan-500/30 hover:border-cyan-400 text-white shadow-[0_10px_35px_rgba(0,240,255,0.25)] backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Open Ask Ayush AI Assistant"
          >
            {/* Pulsing indicator */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
            </span>

            <div className="flex items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles text-xs text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="font-mono text-xs font-semibold tracking-wide hidden sm:inline">Ask Ayush AI</span>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[995] w-[92vw] sm:w-[420px] h-[560px] max-h-[85vh] flex flex-col rounded-2xl bg-[#070c16]/95 border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(0,240,255,0.15)] backdrop-blur-2xl overflow-hidden font-sans animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0c1424] border-b border-cyan-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                <i className="fa-solid fa-brain text-xs" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
                  Ask Ayush AI
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    RAG v2
                  </span>
                </h4>
                <p className="text-[10px] text-white/40 font-mono">portfolio.json Context Stream</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  playTick('click');
                  setIsOpen(false);
                }}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition flex items-center justify-center"
                title="Close AI Assistant"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,240,255,0.15) transparent' }}
          >
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div key={m.id} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 leading-relaxed ${
                      isAi
                        ? 'bg-[#0f1a2e] text-slate-200 border border-cyan-500/20 rounded-tl-sm'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-medium rounded-tr-sm shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Related Project Preview Pill */}
                    {m.relatedProject && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-cyan-300 font-medium truncate">
                          📁 {m.relatedProject.title}
                        </span>
                        <Link
                          to={`/projects/${m.relatedProject.slug || m.relatedProject.id}`}
                          onClick={() => {
                            playTick('click');
                            setIsOpen(false);
                          }}
                          className="text-white hover:text-cyan-300 underline underline-offset-2 shrink-0 ml-2"
                        >
                          View Case Study →
                        </Link>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-white/30 font-mono mt-1 px-1">
                    {m.timestamp}
                  </span>

                  {/* Follow-up / Suggestion Chips for latest AI message */}
                  {isAi && m.followUps && m.followUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.followUps.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(chip)}
                          className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 text-white/70 hover:text-cyan-300 transition text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono p-2">
                <i className="fa-solid fa-circle-notch animate-spin" />
                <span>Searching portfolio embeddings...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#0a101d] border-t border-white/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputVal);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={() => playTick('tick')}
                placeholder="Ask about MongoDB, projects, hiring..."
                className="flex-1 bg-[#050810] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none font-mono focus:ring-1 focus:ring-cyan-500/30 transition"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || loading}
                className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black flex items-center justify-center transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0"
              >
                <i className="fa-solid fa-paper-plane text-xs" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
