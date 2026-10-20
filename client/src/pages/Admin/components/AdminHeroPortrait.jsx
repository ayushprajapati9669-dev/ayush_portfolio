import React, { useState } from 'react';
import { uploadImageViaCloudinary } from '../../../services/api';
import { playTick } from '../../../utils/audio';

export function AdminHeroPortrait({
  appState,
  updateAppState,
  session,
  showToast
}) {
  const p = appState.profile || {};
  const [photoUrl, setPhotoUrl] = useState(p.photoUrl || '');
  const [availabilityLabel, setAvailabilityLabel] = useState(
    p.availabilityLabel || 'Available for Software Engineering Internships & Roles'
  );
  const [primaryCtaText, setPrimaryCtaText] = useState(p.primaryCtaText || 'View Projects');
  const [secondaryCtaText, setSecondaryCtaText] = useState(p.secondaryCtaText || 'Download Resume');

  const handleSave = (e) => {
    e.preventDefault();
    playTick();
    updateAppState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        photoUrl: photoUrl.trim(),
        availabilityLabel: availabilityLabel.trim(),
        primaryCtaText: primaryCtaText.trim(),
        secondaryCtaText: secondaryCtaText.trim()
      }
    }), session.token);

    showToast('Hero portrait and CTA settings saved successfully!', 'fa-image');
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="glass-card-admin p-6 sm:p-8 space-y-6">
        <div className="border-b border-white/10 pb-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-image text-cyan-400" />
            <span>Hero Portrait & Action Triggers</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage the hero banner image, status badge, and call-to-action buttons shown on the main page.
          </p>
        </div>

        {/* Hero Photo Upload & Preview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 items-center">
          <div className="sm:col-span-8 space-y-4">
            <div>
              <label className="block font-mono text-xs text-cyan-400 font-bold mb-1">
                Upload Hero Portrait Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  showToast('Uploading hero portrait...');
                  const url = await uploadImageViaCloudinary(file, appState.settings);
                  if (url) {
                    setPhotoUrl(url);
                    showToast('Portrait image uploaded successfully!');
                  }
                }}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1">
                Or Direct Image URL
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://.../ayush-portrait.jpg"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="sm:col-span-4 flex justify-center">
            {photoUrl ? (
              <div className="relative group">
                <img
                  src={photoUrl}
                  alt="Hero portrait preview"
                  className="h-44 w-36 object-cover rounded-2xl border-2 border-cyan-400/50 shadow-xl shadow-cyan-400/20"
                />
                <span className="absolute -bottom-2 -right-2 bg-emerald-400 text-black text-[9px] font-bold px-2 py-0.5 rounded-full border border-black font-mono">
                  ACTIVE
                </span>
              </div>
            ) : (
              <div className="h-44 w-36 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center font-mono text-xs text-slate-500 gap-2">
                <i className="fa-solid fa-user text-2xl opacity-40" />
                <span>No Photo</span>
              </div>
            )}
          </div>
        </div>

        {/* Availability Badge */}
        <div>
          <label className="block font-mono text-xs text-slate-400 mb-1">
            Availability Status Tag (e.g. Available for Roles & Internships)
          </label>
          <input
            type="text"
            value={availabilityLabel}
            onChange={(e) => setAvailabilityLabel(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

        {/* CTA Button Labels */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Primary Hero CTA Button Text
            </label>
            <input
              type="text"
              value={primaryCtaText}
              onChange={(e) => setPrimaryCtaText(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Secondary Hero CTA Button Text
            </label>
            <input
              type="text"
              value={secondaryCtaText}
              onChange={(e) => setSecondaryCtaText(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-save px-6 py-2.5 text-xs font-bold"
        >
          Save Hero Settings
        </button>
      </form>
    </div>
  );
}

export default AdminHeroPortrait;
