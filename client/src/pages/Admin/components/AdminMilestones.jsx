import React, { useState } from 'react';
import { playTick } from '../../../utils/audio';

function FormErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs text-red-300">
      <svg className="h-3.5 w-3.5 shrink-0 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

export function AdminMilestones({
  appState,
  updateAppState,
  session,
  showToast,
  openConfirmModal
}) {
  const [editingIdx, setEditingIdx] = useState(null);
  const [form, setForm] = useState({
    phase: '',
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const milestones = appState.profile?.learningJourney || [];

  const handleEdit = (idx) => {
    playTick();
    const item = milestones[idx];
    setEditingIdx(idx);
    setForm({
      phase: item.phase || '',
      title: item.title || '',
      description: item.description || ''
    });
    setErrors({});
  };

  const handleCancel = () => {
    playTick();
    setEditingIdx(null);
    setForm({ phase: '', title: '', description: '' });
    setErrors({});
  };

  const handleDelete = (idx) => {
    playTick();
    const item = milestones[idx];
    openConfirmModal(
      'Delete Milestone',
      `Are you sure you want to delete "${item?.title || 'this milestone'}"?`,
      () => {
        updateAppState((prev) => {
          const updated = [...(prev.profile?.learningJourney || [])];
          updated.splice(idx, 1);
          return {
            ...prev,
            profile: {
              ...prev.profile,
              learningJourney: updated
            }
          };
        }, session.token);
        if (editingIdx === idx) {
          handleCancel();
        }
        showToast('Milestone deleted successfully.');
      }
    );
  };

  const handleMove = (idx, direction) => {
    playTick();
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= milestones.length) return;
    const list = [...milestones];
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    updateAppState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        learningJourney: list
      }
    }), session.token);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Milestone title is required.';
    if (!form.description.trim()) errs.description = 'Milestone description is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    playTick();

    const cleanItem = {
      phase: form.phase.trim() || 'Phase',
      title: form.title.trim(),
      description: form.description.trim()
    };

    updateAppState((prev) => {
      const list = [...(prev.profile?.learningJourney || [])];
      if (editingIdx !== null) {
        list[editingIdx] = cleanItem;
      } else {
        list.push(cleanItem);
      }
      return {
        ...prev,
        profile: {
          ...prev.profile,
          learningJourney: list
        }
      };
    }, session.token);

    showToast(editingIdx !== null ? 'Milestone updated!' : 'Milestone added!', 'fa-timeline');
    handleCancel();
  };

  return (
    <div className="space-y-8">
      {/* Milestone Form */}
      <form onSubmit={handleSave} noValidate className="glass-card-admin p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-xl font-bold text-white">
            {editingIdx !== null ? 'Edit Academic Milestone' : 'Add Milestone / Journey Highlight'}
          </h2>
          {editingIdx !== null && (
            <button
              type="button"
              onClick={handleCancel}
              className="font-mono text-xs text-slate-400 hover:text-white"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Phase / Year (e.g. 2023 - Present)
            </label>
            <input
              type="text"
              value={form.phase}
              onChange={(e) => setForm({ ...form, phase: e.target.value })}
              placeholder="e.g. 2023 - Present or Semester 4"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-mono text-xs text-slate-400 mb-1">
              Milestone Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. B.Tech Computer Science & Engineering (CGPA 8.42)"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
            <FormErrorMessage message={errors.title} />
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-slate-400 mb-1">
            Description & Key Learnings *
          </label>
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Details about achievements, coursework, practical projects, or leadership..."
            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
          />
          <FormErrorMessage message={errors.description} />
        </div>

        <button
          type="submit"
          className="btn-save px-6 py-2.5 text-xs font-bold"
        >
          {editingIdx !== null ? 'Save Milestone' : 'Add Milestone'}
        </button>
      </form>

      {/* Timeline List */}
      <div className="glass-card-admin p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Current Journey Timeline ({milestones.length})</h3>
        <div className="space-y-3">
          {milestones.map((item, idx) => (
            <div
              key={item.title + idx}
              className="rounded-2xl border border-white/10 bg-black/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-cyan-400 font-semibold">{item.phase}</span>
                  <span className="text-slate-500">·</span>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMove(idx, -1)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white disabled:opacity-30"
                  title="Move Up"
                >
                  <i className="fa-solid fa-arrow-up text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, 1)}
                  disabled={idx === milestones.length - 1}
                  className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white disabled:opacity-30"
                  title="Move Down"
                >
                  <i className="fa-solid fa-arrow-down text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(idx)}
                  className="text-xs text-amber-400 hover:underline px-2 py-1"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="text-xs text-red-400 hover:underline px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminMilestones;
