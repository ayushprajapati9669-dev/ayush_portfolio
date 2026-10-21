import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { playTick } from '../../../../utils/audio';

export function ActivityDetailModal({ item, onClose, onAction }) {
  const boxRef = useRef(null);

  useEffect(() => {
    if (!item) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && boxRef.current) {
      gsap.fromTo(
        boxRef.current,
        { scale: 0.92, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.2)' }
      );
    }
  }, [item]);

  if (!item) return null;

  return (
    <div
      className="activity-detail-modal active"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div ref={boxRef} className="activity-detail-box" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <div
            className="detail-icon"
            style={{
              background: item.iconBg || 'rgba(0, 240, 255, 0.1)',
              border: item.iconBorder || '1px solid rgba(0, 240, 255, 0.2)',
              color: item.iconColor || 'var(--accent-1)'
            }}
          >
            {item.iconElement || <i className={`fa-solid ${item.icon || 'fa-bolt'}`} />}
          </div>
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

        <div className="detail-title">{item.title}</div>
        <div className="detail-sub">{item.sub}</div>

        <div className="detail-meta">
          <div className="meta-item">
            <span className="meta-label">Timestamp</span>
            <span className="meta-value">{item.time || 'Just now'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Action Type</span>
            <span className="meta-value" style={{ textTransform: 'capitalize' }}>
              {item.type || 'Activity'}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Source / Origin</span>
            <span className="meta-value">{item.source || 'Portfolio System'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Status</span>
            <span className="meta-value" style={{ color: 'var(--accent-2, #00ff88)' }}>
              Completed
            </span>
          </div>
        </div>

        <div className="detail-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => {
              playTick();
              onClose();
            }}
          >
            Close
          </button>
          <button
            type="button"
            className="btn-view-page"
            onClick={() => {
              playTick();
              if (onAction) onAction(item);
              onClose();
            }}
          >
            <span>{item.actionLabel || 'View Page'}</span>
            <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActivityDetailModal;
