import React, { useState } from 'react';
import { playTick } from '../../../../utils/audio';

export function QuickProjectModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [stack, setStack] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }
    playTick();
    onSave({
      title: title.trim(),
      technologies: stack.trim() || 'React JS, Node.js, Express.js, MongoDB'
    });
    setTitle('');
    setStack('');
    onClose();
  };

  return (
    <div
      className="premium-modal active"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add New Project</h3>
          <button
            type="button"
            className="modal-close"
            onClick={() => {
              playTick();
              onClose();
            }}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div>
          <label className="modal-label">Project Title *</label>
          <input
            type="text"
            className="modal-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AI Chat & Code Assistant"
            autoFocus
          />
        </div>

        <div>
          <label className="modal-label">Tech Stack (comma-separated)</label>
          <input
            type="text"
            className="modal-input"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            placeholder="e.g. React, Node.js, Express, MongoDB"
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => {
              playTick();
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-save"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickProjectModal;
