// src/pages/Users.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { usersApi } from '../api/client';
import { Badge, Modal, ConfirmModal, Pagination, EmptyState, PageLoader, Spinner, ToastContainer } from '../components/UI';
import { useToast } from '../hooks/useToast';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'viewer', status: 'active' };

function UserForm({ form, setForm, errors, loading, onSubmit, onClose, editing }) {
  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label">Full Name *</label>
        <input className="form-input" name="name" placeholder="Alice Smith" value={form.name} onChange={change} />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Email *</label>
        <input className="form-input" name="email" type="email" placeholder="alice@company.com" value={form.email} onChange={change} disabled={editing} />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>
      {!editing && (
        <div className="form-group">
          <label className="form-label">Password *</label>
          <input className="form-input" name="password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" value={form.password} onChange={change} />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Role *</label>
          <select className="form-select" name="role" value={form.role} onChange={change}>
            <option value="viewer">Viewer</option>
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status *</label>
          <select className="form-select" name="status" value={form.status} onChange={change}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      {errors.general && (
        <div style={{ background: 'var(--rose-dim)', color: '#9F1239', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: '.85rem' }}>
          {errors.general}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Spinner /> : (editing ? 'Save Changes' : 'Create User')}
        </button>
      </div>
    </form>
  );
}

export default function Users() {
  const { toasts, toast } = useToast();

  const [users,   setUsers]   = useState([]);
  const [meta,    setMeta]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [roleFilter, setRoleFilter] = useState('');

  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({ page, limit: 15, ...(roleFilter ? { role: roleFilter } : {}) });
      setUsers(res.data);
      setMeta(res.meta);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_FORM); setErrors({}); setSelected(null); setModal('create'); };
  const openEdit   = (u) => { setForm({ name: u.name, email: u.email, password: '', role: u.role, status: u.status }); setErrors({}); setSelected(u); setModal('edit'); };
  const openDelete = (u) => { setSelected(u); setModal('delete'); };
  const closeModal = ()  => { setModal(null); setSelected(null); };

  const validate = () => {
    const e = {};
    if (!form.name?.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters.';
    if (!form.email) e.email = 'Valid email required.';
    if (!selected && (!form.password || form.password.length < 8)) e.password = 'Password must be at least 8 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (modal === 'create') {
        await usersApi.create(form);
        toast.success('User created successfully.');
      } else {
        const body = { name: form.name, role: form.role, status: form.status };
        if (form.password) body.password = form.password;
        await usersApi.update(selected.id, body);
        toast.success('User updated successfully.');
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
      await usersApi.delete(selected.id);
      toast.success('User deleted.');
      closeModal();
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-sub">{meta ? `${meta.total} team members` : 'Manage team access'}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select className="form-select" style={{ width: 140 }} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </select>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner large /></div>
        ) : users.length === 0 ? (
          <EmptyState icon="👥" title="No users found" sub="Create the first team member." />
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--violet-light), var(--rose-light))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.8rem', color: '#fff',
                          flexShrink: 0,
                        }}>{u.name?.[0]?.toUpperCase()}</div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{u.email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {u.role === 'admin' && <ShieldCheck size={13} color="var(--violet)" />}
                        <Badge type={u.role} />
                      </div>
                    </td>
                    <td><Badge type={u.status} /></td>
                    <td style={{ color: 'var(--muted)', fontSize: '.82rem' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(u)} title="Edit"><Pencil size={13} /></button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openDelete(u)} title="Delete" style={{ color: 'var(--rose)' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '12px 20px' }}>
          <Pagination meta={meta} onPage={setPage} />
        </div>
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Create User' : 'Edit User'} onClose={closeModal}>
          <UserForm form={form} setForm={setForm} errors={errors} loading={saving}
            onSubmit={handleSubmit} onClose={closeModal} editing={modal === 'edit'} />
        </Modal>
      )}

      {modal === 'delete' && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete ${selected?.name}? They will lose all access immediately.`}
          onConfirm={handleDelete} onClose={closeModal} loading={saving}
        />
      )}
    </div>
  );
}
