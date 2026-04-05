// src/components/UI/index.jsx
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ type }) {
  const map = {
    income:   'badge-income',
    expense:  'badge-expense',
    admin:    'badge-admin',
    analyst:  'badge-analyst',
    viewer:   'badge-viewer',
    active:   'badge-active',
    inactive: 'badge-inactive',
  };
  return <span className={`badge ${map[type] || ''}`}>{type}</span>;
}

// ── Toast container ───────────────────────────────────────────────────────────
const iconMap = {
  success: <CheckCircle size={16} />,
  error:   <AlertCircle size={16} />,
  info:    <Info size={16} />,
};

export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {iconMap[t.type]}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ large }) {
  return <div className={`spinner ${large ? 'spinner-lg' : ''}`} />;
}

export function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Spinner large />
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ meta, onPage }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages } = meta;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  const rendered = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) rendered.push(<span key={`gap-${p}`} style={{ padding: '0 4px', color: 'var(--muted)' }}>…</span>);
    rendered.push(
      <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>
        {p}
      </button>
    );
  });

  return (
    <div className="pagination">
      <button className="page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</button>
      {rendered}
      <button className="page-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>›</button>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, sub }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
export function ConfirmModal({ title, message, onConfirm, onClose, loading }) {
  return (
    <Modal title={title} onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Spinner /> : 'Delete'}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{message}</p>
    </Modal>
  );
}
