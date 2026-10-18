import React from 'react';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-lg px-4 pt-20 pb-24 text-center space-y-4">
      <p className="font-mono text-xs uppercase tracking-widest text-vermilion">ERROR 404</p>
      <h1 className="font-display text-4xl font-extrabold text-alabaster">Page Not Found</h1>
      <p className="text-sm text-stonewarm">The requested route does not exist in Ayush Prajapati's portfolio.</p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="focus-ring rounded-full bg-vermilion px-6 py-2.5 text-xs font-bold text-obsidian"
      >
        Back to Home
      </button>
    </div>
  );
}
