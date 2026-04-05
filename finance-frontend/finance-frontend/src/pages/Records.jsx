// src/pages/Records.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Filter, X } from 'lucide-react';
import { recordsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Badge, Modal, ConfirmModal, Pagination, EmptyState, PageLoader, Spinner, ToastContainer } from '../components/UI';
import { useToast } from '../hooks/useToast';

const fmt  = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const CATS = ['Salary','Freelance','Investment','Rent','Groceries','Utilities','Transport','Dining','Healthcare','Entertainment','Equipment','Other'];

const EMPTY_FORM = { amount: '', type: 'income', category: '', date: '', notes: '' };

function RecordForm({ form, setForm, errors, loading, onSubmit, onClose, editing }) {
  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Type *</label>
          <select className="form-select" name="type" value={form.type} onChange={change}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Amount *</label>
          <input className={`form-input ${errors.amount ? 'error' : ''}`} name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount} onChange={change} />
          {errors.amount && <span className="form-error">{errors.amount}</span>}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select className="form-select" name="category" value={form.category} onChange={change}>
            <option value="">Select category</option>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
          {errors.category && <span className="form-error">{errors.category}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Date *</label>
          <input className="form-input" name="date" type="date" value={form.date} onChange={change} />
          {errors.date && <span className="form-error">{errors.date}</span>}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <input className="form-input" name="notes" placeholder="Optional description..." value={form.notes} onChange={change} />
      </div>
      {errors.general && (
        <div style={{ background: 'var(--rose-dim)', color: '#9F1239', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: '.85rem' }}>
          {errors.general}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Spinner /> : (editing ? 'Update Record' : 'Create Record')}
        </button>
      </div>
    </form>
  );
}

export default function Records() {
  const { canWrite } = useAuth();
  const { toasts, toast } = useToast();

  const [records, setRecords]       = useState([]);
  const [meta,    setMeta]          = useState(null);
  const [loading, setLoading]       = useState(true);

  const [filters, setFilters] = useState({ type: '', category: '', dateFrom: '', dateTo: '', page: 1, limit: 15, sortBy: 'date', order: 'desc' });
  const [showFilters, setShowFilters] = useState(false);

  const [modal,    setModal]    = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recordsApi.list(filters);
      setRecords(res.data);
      setMeta(res.meta);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_FORM); setErrors({}); setSelected(null); setModal('create'); };
  const openEdit   = (r) => { setForm({ amount: r.amount, type: r.type, category: r.category, date: r.date, notes: r.notes || '' }); setErrors({}); setSelected(r); setModal('edit'); };
  const openDelete = (r) => { setSelected(r); setModal('delete'); };
  const closeModal = ()  => { setModal(null); setSelected(null); };

  const validate = () => {
    const e = {};
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount = 'Enter a positive amount.';
    if (!form.category) e.category = 'Select a category.';
    if (!form.date) e.date = 'Select a date.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (modal === 'create') {
        await recordsApi.create(form);
        toast.success('Record created successfully.');
      } else {
        await recordsApi.update(selected.id, form);
        toast.success('Record updated successfully.');
      }
      closeModal();
      load();
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await recordsApi.delete(selected.id);
      toast.success('Record deleted.');
      closeModal();
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  return (
    <div>
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Records</h1>
          <p className="page-sub">{meta ? `${meta.total} financial entries` : 'Financial transactions'}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setShowFilters((v) => !v)}>
            <Filter size={15} /> Filters
          </button>
          {canWrite && (
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} /> Add Record
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filter-bar">
          <select className="form-select" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="form-select" value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
            <option value="">All Categories</option>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input className="form-input" type="date" placeholder="From" value={filters.dateFrom} onChange={(e) => setFilter('dateFrom', e.target.value)} style={{ maxWidth: 160 }} />
          <input className="form-input" type="date" placeholder="To"   value={filters.dateTo}   onChange={(e) => setFilter('dateTo', e.target.value)}   style={{ maxWidth: 160 }} />
          <select className="form-select" value={filters.sortBy} onChange={(e) => setFilter('sortBy', e.target.value)}>
            <option value="date">Sort: Date</option>
            <option value="amount">Sort: Amount</option>
          </select>
          <select className="form-select" value={filters.order} onChange={(e) => setFilter('order', e.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setFilters({ type:'',category:'',dateFrom:'',dateTo:'',page:1,limit:15,sortBy:'date',order:'desc' }); }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner large /></div>
        ) : records.length === 0 ? (
          <EmptyState icon="📭" title="No records found" sub="Try adjusting your filters or create a new record." />
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Type</th><th>Category</th><th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  {canWrite && <th style={{ textAlign: 'center' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--muted)', fontSize: '.82rem', whiteSpace: 'nowrap' }}>{r.date}</td>
                    <td><Badge type={r.type} /></td>
                    <td style={{ fontWeight: 600 }}>{r.category}</td>
                    <td style={{ color: 'var(--muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, color: r.type === 'income' ? 'var(--emerald)' : 'var(--rose)', whiteSpace: 'nowrap' }}>
                      {r.type === 'income' ? '+' : '−'}{fmt(r.amount)}
                    </td>
                    {canWrite && (
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(r)} title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openDelete(r)} title="Delete" style={{ color: 'var(--rose)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '12px 20px' }}>
          <Pagination meta={meta} onPage={(p) => setFilter('page', p)} />
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Add Financial Record' : 'Edit Record'} onClose={closeModal}>
          <RecordForm form={form} setForm={setForm} errors={errors} loading={saving}
            onSubmit={handleSubmit} onClose={closeModal} editing={modal === 'edit'} />
        </Modal>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <ConfirmModal
          title="Delete Record"
          message={`Are you sure you want to delete this ${selected?.category} entry of ${fmt(selected?.amount)}? This action cannot be undone.`}
          onConfirm={handleDelete} onClose={closeModal} loading={saving}
        />
      )}
    </div>
  );
}
