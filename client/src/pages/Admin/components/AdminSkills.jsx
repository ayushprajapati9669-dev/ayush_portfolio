import React, { useState } from 'react';
import { TechLogo } from '../../../components/common/TechLogos';
import { playTick } from '../../../utils/audio';

export function AdminSkills({
  appState,
  updateAppState,
  session,
  showToast
}) {
  const skillCategories = appState.skills || [];
  const [selectedCatId, setSelectedCatId] = useState(
    skillCategories[0]?.id || 'skill-languages'
  );
  const [name, setName] = useState('');
  const [logoKey, setLogoKey] = useState('');
  const [error, setError] = useState('');

  const activeCategory =
    skillCategories.find((c) => c.id === selectedCatId) || skillCategories[0];

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Skill name is required.');
      return;
    }
    playTick();
    const cleanName = name.trim();
    const cleanKey = (logoKey.trim() || cleanName).toLowerCase();

    updateAppState((prev) => ({
      ...prev,
      skills: (prev.skills || []).map((cat) =>
        cat.id === selectedCatId
          ? {
              ...cat,
              items: [...(cat.items || []), { name: cleanName, logoKey: cleanKey }]
            }
          : cat
      )
    }), session.token);

    setName('');
    setLogoKey('');
    setError('');
    showToast(`Added "${cleanName}" to skills.`, 'fa-code');
  };

  const handleDeleteSkill = (catId, skillName) => {
    playTick();
    updateAppState((prev) => ({
      ...prev,
      skills: (prev.skills || []).map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              items: (cat.items || []).filter((item) => item.name !== skillName)
            }
          : cat
      )
    }), session.token);
    showToast(`Removed "${skillName}".`);
  };

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="glass-card-admin p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Manage Technical Skills</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a category to view and add/remove technologies from your live interactive skill widget.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {skillCategories.map((cat) => {
            const isSelected = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`filter-chip ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  playTick();
                  setSelectedCatId(cat.id);
                }}
              >
                <span>{cat.categoryName || cat.id}</span>
                <span className="ml-1 text-[10px] opacity-70 font-mono">
                  ({(cat.items || []).length})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Skill Form & List for Active Category */}
      {activeCategory && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Add Skill Form */}
          <div className="lg:col-span-5 glass-card-admin p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-plus text-cyan-400" />
              <span>Add Skill to {activeCategory.categoryName}</span>
            </h3>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-1">
                  Technology / Skill Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!logoKey) {
                      setLogoKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }
                  }}
                  placeholder="e.g. Next.js, Redux, Docker"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                />
                {error && <p className="mt-1 font-mono text-[11px] text-red-400">{error}</p>}
              </div>

              <div>
                <label className="block font-mono text-xs text-slate-400 mb-1">
                  Devicon / Logo Identifier (optional)
                </label>
                <input
                  type="text"
                  value={logoKey}
                  onChange={(e) => setLogoKey(e.target.value)}
                  placeholder="e.g. react, nodejs, mongodb"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Used to look up the official Devicon icon SVG. Defaults to the skill name.
                </p>
              </div>

              <button
                type="submit"
                className="btn-save w-full py-2.5 text-xs font-bold"
              >
                Add Skill to {activeCategory.categoryName}
              </button>
            </form>
          </div>

          {/* Current Skills in Category */}
          <div className="lg:col-span-7 glass-card-admin p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                Current Skills in {activeCategory.categoryName} ({(activeCategory.items || []).length})
              </h3>
            </div>

            <div className="flex flex-wrap gap-2.5 max-h-[400px] overflow-y-auto pr-2">
              {(activeCategory.items || []).map((skill, idx) => (
                <div
                  key={skill.name + idx}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 transition-all hover:border-cyan-400/50"
                >
                  <TechLogo name={skill.logoKey || skill.name} className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-semibold text-white">{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(activeCategory.id, skill.name)}
                    className="ml-1 text-slate-400 hover:text-red-400 transition-colors"
                    title={`Delete ${skill.name}`}
                  >
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSkills;
