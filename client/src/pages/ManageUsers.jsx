import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    User, Mail, Shield, Calendar, Trash2, Users,
    Search, UserPlus, CheckCircle2, ShieldAlert, X,
    Eye, EyeOff, Pencil, AlertCircle, Lock, Zap, Activity
} from 'lucide-react';

/* ── Modal Component ─────────────────────────────────────── */
const UserModal = ({ mode, user, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || 'user',
        specialties: user?.specialties || [],
    });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const isEdit = mode === 'edit';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await onSave(form);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '16px'
        }}>
            <div className="srp-card" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
                {/* Modal Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: 700, color: 'var(--srp-text)' }}>
                            {isEdit ? 'Edit User' : 'Add New User'}
                        </h2>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                            {isEdit ? `Editing ${user?.name}` : 'Create a new portal account'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-ghost-srp"
                        style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 14px', borderRadius: 'var(--srp-radius)',
                        backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
                        marginBottom: '16px', fontSize: '13px', color: '#991B1B'
                    }}>
                        <AlertCircle size={14} style={{ flexShrink: 0 }} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--srp-text)', marginBottom: '5px' }}>
                            Full Name
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--srp-text-light)' }} />
                            <input
                                type="text" className="srp-input"
                                placeholder="John Doe"
                                required
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                style={{ paddingLeft: '32px' }}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--srp-text)', marginBottom: '5px' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--srp-text-light)' }} />
                            <input
                                type="email" className="srp-input"
                                placeholder="user@company.com"
                                required
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                style={{ paddingLeft: '32px' }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--srp-text)', marginBottom: '5px' }}>
                            {isEdit ? 'New Password' : 'Password'}
                            {isEdit && <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--srp-text-muted)', fontWeight: 400 }}>(leave blank to keep unchanged)</span>}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--srp-text-light)' }} />
                            <input
                                type={showPw ? 'text' : 'password'} className="srp-input"
                                placeholder={isEdit ? '••••••• (optional)' : 'Min. 6 characters'}
                                required={!isEdit}
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                style={{ paddingLeft: '32px', paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--srp-text-light)', padding: '2px' }}
                            >
                                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Role */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--srp-text)', marginBottom: '5px' }}>
                            Role
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['user', 'technician', 'manager'].map(r => (
                                <button
                                    key={r} type="button"
                                    onClick={() => setForm({ ...form, role: r })}
                                    style={{
                                        flex: 1, padding: '8px', border: '1px solid',
                                        borderRadius: 'var(--srp-radius)', cursor: 'pointer',
                                        fontSize: '13px', fontWeight: 600, textTransform: 'capitalize',
                                        transition: 'all 0.15s ease',
                                        borderColor: form.role === r ? 'var(--srp-primary)' : 'var(--srp-border)',
                                        backgroundColor: form.role === r ? 'var(--srp-primary-light)' : 'var(--srp-card-bg)',
                                        color: form.role === r ? 'var(--srp-primary)' : 'var(--srp-text-muted)',
                                    }}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Specialties (Only for Technician) */}
                    {form.role === 'technician' && (
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--srp-text)', marginBottom: '8px' }}>
                                Technician Specialties
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {['Technical', 'Hardware', 'Software', 'Network', 'Infrastructure', 'Billing', 'Account', 'Other'].map(cat => {
                                    const isSelected = form.specialties.includes(cat);
                                    return (
                                        <button
                                            key={cat} type="button"
                                            onClick={() => {
                                                const newSpecs = isSelected
                                                    ? form.specialties.filter(s => s !== cat)
                                                    : [...form.specialties, cat];
                                                setForm({ ...form, specialties: newSpecs });
                                            }}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                border: '1px solid',
                                                borderColor: isSelected ? 'var(--srp-primary)' : 'var(--srp-border)',
                                                backgroundColor: isSelected ? 'var(--srp-primary)' : 'var(--srp-card-bg)',
                                                color: isSelected ? 'white' : 'var(--srp-text-muted)',
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" onClick={onClose} className="srp-btn srp-btn-secondary" style={{ flex: 1 }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="srp-btn srp-btn-primary" style={{ flex: 1 }}>
                            {saving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── Main Page ───────────────────────────────────────────── */
const ManageUsers = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null); // null | { mode: 'add' | 'edit', user?: {} }

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await api.get('/admin/users');
            return res.data;
        }
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users'] });

    const handleSave = async (form) => {
        if (modal.mode === 'add') {
            await api.post('/admin/users', form);
        } else {
            const payload = { name: form.name, email: form.email, role: form.role, specialties: form.specialties };
            if (form.password) payload.password = form.password;
            await api.put(`/admin/users/${modal.user._id}`, payload);
        }
        invalidate();
        setModal(null);
    };

    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Delete ${userName}? This is permanent.`)) return;
        await api.delete(`/admin/users/${userId}`);
        invalidate();
    };

    const users = (data?.data || []).filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Modal */}
            {modal && (
                <UserModal
                    mode={modal.mode}
                    user={modal.user}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}

            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: 'var(--srp-text)' }}>Manage Users</h1>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                        Create, edit, and manage portal accounts
                    </p>
                </div>
                <button
                    onClick={() => setModal({ mode: 'add' })}
                    className="srp-btn srp-btn-primary"
                >
                    <UserPlus size={16} />
                    Add New User
                </button>
            </div>

            {/* User Table Card */}
            <div className="srp-card" style={{ overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', borderBottom: '1px solid var(--srp-border)', gap: '12px', flexWrap: 'wrap'
                }}>
                    <div style={{ position: 'relative', flex: '1 1 240px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--srp-text-light)' }} />
                        <input
                            type="text" className="srp-input"
                            placeholder="Search by name, email or role..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '32px', fontSize: '13px' }}
                        />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--srp-text-muted)', fontWeight: 500, flexShrink: 0 }}>
                        {users.length} {users.length === 1 ? 'user' : 'users'}
                    </span>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div style={{ padding: '48px', textAlign: 'center' }}>
                        <div className="spinner-border text-primary" role="status" style={{ width: '24px', height: '24px', borderWidth: '3px' }} />
                    </div>
                ) : (
                    <table className="srp-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                                                backgroundColor: 'var(--srp-primary-light)', color: 'var(--srp-primary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '14px', fontWeight: 700
                                            }}>
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 600, color: 'var(--srp-text)' }}>{u.name}</p>
                                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--srp-text-muted)' }}>{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge-status ${u.role === 'admin' ? 'badge-medium' : (u.role === 'manager' ? 'badge-medium' : (u.role === 'technician' ? 'badge-in-progress' : 'badge-resolved'))}`} style={{ textTransform: 'capitalize' }}>
                                            {u.role === 'admin' ? <ShieldAlert size={11} style={{ marginRight: '4px' }} /> : (u.role === 'manager' ? <Activity size={11} style={{ marginRight: '4px' }} /> : (u.role === 'technician' ? <Zap size={11} style={{ marginRight: '4px' }} /> : <CheckCircle2 size={11} style={{ marginRight: '4px' }} />))}
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                                            {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                            <button
                                                onClick={() => setModal({ mode: 'edit', user: u })}
                                                className="btn-ghost-srp"
                                                style={{ width: '32px', height: '32px', borderRadius: '6px' }}
                                                title="Edit User"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u._id, u.name)}
                                                className="btn-ghost-srp"
                                                style={{ width: '32px', height: '32px', borderRadius: '6px', color: 'var(--srp-danger)' }}
                                                title="Delete User"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--srp-text-muted)', fontSize: '14px' }}>
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
