import React, { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { generateQRCodeMatrix, generateQRCodeSVGPath } from '../../utils/qrCodeGenerator';
import { playTick } from '../../utils/audio';

export function CertificateQRCodeModal({ cert, isOpen, onClose, showToast }) {
  const modalBoxRef = useRef(null);
  const canvasRef = useRef(null);
  const [targetType, setTargetType] = useState('credential'); // 'credential' or 'portfolio'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      playTick();
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion && modalBoxRef.current) {
        gsap.fromTo(
          modalBoxRef.current,
          { scale: 0.92, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.2)' }
        );
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Determine active target URL
  const targetUrl = useMemo(() => {
    if (!cert) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const portfolioUrl = `${origin}/certificates?id=${cert.id || ''}`;

    if (targetType === 'portfolio') {
      return portfolioUrl;
    }
    return cert.credentialUrl || cert.downloadUrl || cert.imageUrl || portfolioUrl;
  }, [cert, targetType]);

  // Generate QR Code Matrix and SVG path
  const { path, size } = useMemo(() => {
    if (!targetUrl) return { path: '', size: 25 };
    try {
      const matrix = generateQRCodeMatrix(targetUrl);
      return generateQRCodeSVGPath(matrix);
    } catch {
      return { path: '', size: 25 };
    }
  }, [targetUrl]);

  if (!isOpen || !cert) return null;

  // Copy URL to clipboard
  const handleCopyLink = async () => {
    playTick();
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      if (showToast) showToast('Verification URL copied to clipboard!', 'fa-copy');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      if (showToast) showToast('Failed to copy URL', 'fa-triangle-exclamation');
    }
  };

  // Download high-resolution PNG QR Code
  const handleDownloadPNG = () => {
    playTick();
    try {
      const canvas = document.createElement('canvas');
      const canvasSize = 800;
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark background with subtle gradient
      ctx.fillStyle = '#0a0f16';
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // White inner card for maximum scanner contrast & readability
      const padding = 60;
      const cardSize = canvasSize - padding * 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(padding, padding, cardSize, cardSize, 28);
      ctx.fill();

      // Draw QR modules
      const matrix = generateQRCodeMatrix(targetUrl);
      const mSize = matrix.length;
      const qrPadding = 35;
      const usableSize = cardSize - qrPadding * 2;
      const modulePixelSize = usableSize / mSize;
      const startX = padding + qrPadding;
      const startY = padding + qrPadding;

      ctx.fillStyle = '#060a10';
      for (let r = 0; r < mSize; r++) {
        for (let c = 0; c < mSize; c++) {
          if (matrix[r][c]) {
            ctx.fillRect(
              startX + c * modulePixelSize,
              startY + r * modulePixelSize,
              modulePixelSize + 0.5,
              modulePixelSize + 0.5
            );
          }
        }
      }

      // Download trigger
      const link = document.createElement('a');
      const cleanTitle = (cert.title || 'certificate').replace(/[^A-Za-z0-9]/g, '_');
      link.download = `${cleanTitle}_QRCode.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      if (showToast) showToast('QR Code downloaded as high-res PNG!', 'fa-download');
    } catch (e) {
      if (showToast) showToast('Could not download QR Code PNG', 'fa-circle-xmark');
    }
  };

  // Download SVG
  const handleDownloadSVG = () => {
    playTick();
    const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size + 4} ${size + 4}" width="500" height="500" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <g transform="translate(2, 2)">
    <path d="${path}" fill="#060a10"/>
  </g>
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const cleanTitle = (cert.title || 'certificate').replace(/[^A-Za-z0-9]/g, '_');
    link.download = `${cleanTitle}_QRCode.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast('QR Code exported as vector SVG!', 'fa-download');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playTick();
          onClose();
        }
      }}
    >
      <div
        ref={modalBoxRef}
        className="w-full max-w-lg rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0f172a] to-[#060a10] p-6 shadow-2xl shadow-cyan-500/10 text-white relative overflow-hidden"
      >
        {/* Glow corner */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                <i className="fa-solid fa-qrcode text-[10px]" /> QR Verification
              </span>
              <span className="font-mono text-xs text-slate-400">{cert.issuer}</span>
            </div>
            <h3 className="text-lg font-bold text-white line-clamp-1">{cert.title}</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              playTick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white transition-all"
            title="Close (Esc)"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Destination Switcher */}
        <div className="mt-4 flex rounded-xl border border-white/10 bg-black/40 p-1">
          <button
            type="button"
            onClick={() => {
              playTick();
              setTargetType('credential');
            }}
            className={`flex-1 rounded-lg py-1.5 font-mono text-xs font-semibold transition-all ${
              targetType === 'credential'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Issuer Portal Link
          </button>
          <button
            type="button"
            onClick={() => {
              playTick();
              setTargetType('portfolio');
            }}
            className={`flex-1 rounded-lg py-1.5 font-mono text-xs font-semibold transition-all ${
              targetType === 'portfolio'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Portfolio Showcase Link
          </button>
        </div>

        {/* QR Code Display Card */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="relative rounded-3xl border-2 border-cyan-400/40 bg-white p-5 shadow-2xl shadow-cyan-500/20 group">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="h-52 w-52 sm:h-60 sm:w-60"
              shapeRendering="crispEdges"
            >
              <rect width="100%" height="100%" fill="#ffffff" />
              <path d={path} fill="#0a0f16" />
            </svg>

            {/* Center Logo Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0a0f16] border-2 border-cyan-400 text-cyan-400 shadow-md">
                <i className="fa-solid fa-certificate text-base" />
              </div>
            </div>
          </div>

          <p className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <i className="fa-solid fa-camera text-cyan-400 text-xs" />
            <span>Scan with phone camera to instantly verify credential</span>
          </p>
        </div>

        {/* Active URL Snippet */}
        <div className="rounded-2xl border border-white/10 bg-black/50 p-3 flex items-center justify-between gap-3 text-xs">
          <div className="truncate font-mono text-[11px] text-slate-300">
            <span className="text-cyan-400 select-none">URL: </span>
            <span className="select-all">{targetUrl}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className={`shrink-0 rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-all flex items-center gap-1 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
            }`}
          >
            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} />
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2.5 font-mono text-xs font-semibold text-slate-200 hover:border-cyan-400/40 hover:text-white transition-all"
          >
            <i className="fa-solid fa-download text-cyan-400 text-[11px]" />
            <span>PNG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSVG}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2.5 font-mono text-xs font-semibold text-slate-200 hover:border-cyan-400/40 hover:text-white transition-all"
          >
            <i className="fa-solid fa-file-code text-indigo-400 text-[11px]" />
            <span>SVG</span>
          </button>

          {cert.credentialUrl ? (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => playTick()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 py-2.5 font-mono text-xs font-bold text-black hover:opacity-90 transition-all shadow-md shadow-cyan-400/20"
            >
              <span>Visit ↗</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 py-2.5 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition-all"
            >
              <span>Copy Link</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CertificateQRCodeModal;
