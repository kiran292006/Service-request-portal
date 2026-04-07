import React, { useState } from 'react';
import api from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Zap, Plus, Pencil, Trash2, Users, Info,
    CheckCircle2, XCircle, AlertCircle, X, ChevronRight
} from 'lucide-react';
import useRequests from '../hooks/useRequests';

/* ── Category Modal ─────────────────────────────────────── */
const CategoryModal = ({ mode, category, users, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: category?.name || '',
        description: category?.description || '',
        assignedTechnicians: category?.assignedTechnicians?.map(t => t._id) || []
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const technicians = users.filter(u => u.role === 'technician');

    const handleToggleTech = (techId) => {
        setForm(prev => ({
            ...prev,
            assignedTechnicians: prev.assignedTechnicians.includes(techId)
                ? prev.assignedTechnicians.filter(id => id !== techId)
                : [...prev.assignedTechnicians, techId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await onSave(form);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px'
        }}>
            <div className="srp-card animate-srp-fade" style={{ width: '100%', maxWidth: '520px', padding: '32px', boxShadow: 'var(--srp-shadow-lg)', border: '1px solid var(--srp-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--srp-text)', letterSpacing: '-0.02em' }}>
                        {mode === 'edit' ? 'Edit Category' : 'Create New Category'}
                    </h2>
                    <button onClick={onClose} className="btn-ghost-srp" style={{ width: '36px', height: '36px' }}><X size={20} /></button>
                </div>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" style={{ fontSize: '13px', padding: '12px', borderRadius: '10px' }}>
                        <AlertCircle size={16} />
                        <span style={{ fontWeight: 600 }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--srp-text)', marginBottom: '8px' }}>Category Name</label>
                        <input
                            type="text" className="srp-input"
                            required value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Network Issues"
                            style={{ padding: '12px 16px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--srp-text)', marginBottom: '8px' }}>Description</label>
                        <textarea
                            className="srp-input" rows="3"
                            required value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Brief description of what this category covers..."
                            style={{ padding: '12px 16px', lineHeight: 1.6 }}
                        />
                    </div>

                    <div style={{ marginBottom: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--srp-text)' }}>
                                Assigned Technicians
                            </label>
                            <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1" style={{ fontSize: '11px', fontWeight: 800 }}>{form.assignedTechnicians.length} Selected</span>
                        </div>
                        <div style={{
                            maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--srp-border)',
                            borderRadius: '12px', padding: '10px', backgroundColor: 'var(--srp-bg)'
                        }}>
                            {technicians.length === 0 ? (
                                <p style={{ fontSize: '13px', color: 'var(--srp-text-muted)', textAlign: 'center', margin: '24px 0', fontWeight: 500 }}>No technicians found.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {technicians.map(tech => (
                                        <div
                                            key={tech._id}
                                            onClick={() => handleToggleTech(tech._id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                                                backgroundColor: form.assignedTechnicians.includes(tech._id) ? 'var(--srp-card-bg)' : 'transparent',
                                                border: '1px solid',
                                                borderColor: form.assignedTechnicians.includes(tech._id) ? 'var(--srp-primary)' : 'transparent',
                                                transition: 'all 0.2s ease',
                                                boxShadow: form.assignedTechnicians.includes(tech._id) ? 'var(--srp-shadow-sm)' : 'none'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '28px', height: '28px', borderRadius: '8px',
                                                    backgroundColor: 'var(--srp-primary-light)', color: 'var(--srp-primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800
                                                }}>
                                                    {tech.name.charAt(0)}
                                                </div>
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--srp-text)' }}>{tech.name}</span>
                                            </div>
                                            {form.assignedTechnicians.includes(tech._id) ? (
                                                <CheckCircle2 size={16} color="var(--srp-primary)" />
                                            ) : (
                                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--srp-border)' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={onClose} className="srp-btn srp-btn-secondary" style={{ flex: 1, padding: '12px' }}>Cancel</button>
                        <button type="submit" disabled={saving} className="srp-btn srp-btn-primary" style={{ flex: 1, padding: '12px' }}>
                            {saving ? 'Saving...' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── Main Component ─────────────────────────────────────── */
const CategoryManagement = () => {
    const queryClient = useQueryClient();
    const [modal, setModal] = useState(null);
    const { useCategories, useUsers } = useRequests();

    const { data: catData, isLoading: catLoading } = useCategories();
    const categories = catData?.data || [];

    const { data: usersData, isLoading: userLoading } = useUsers();
    const users = usersData?.data || [];

    const handleSave = async (form) => {
        try {
            if (modal.mode === 'add') {
                await api.post('/categories', form);
            } else {
                await api.put(`/categories/${modal.category._id}`, form);
            }
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setModal(null);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save category');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete category "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/categories/${id}`);
            queryClient.invalidateQueries(['categories']);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete category');
        }
    };

    if (catLoading || userLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    return (
        <>
            {modal && (
                <CategoryModal
                    mode={modal.mode}
                    category={modal.category}
                    users={users}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}

            <div className="animate-srp-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div className="animate-srp-slide stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: 800, color: 'var(--srp-text)', letterSpacing: '-0.03em' }}>Category Management</h1>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--srp-text-muted)', fontWeight: 500 }}>
                            Configure dynamic ticket categories and team assignments
                        </p>
                    </div>
                    <button
                        onClick={() => setModal({ mode: 'add' })}
                        className="srp-btn srp-btn-primary"
                        style={{ padding: '12px 24px', borderRadius: '12px' }}
                    >
                        <Plus size={18} /> Add New Category
                    </button>
                </div>

                <div className="row g-4 animate-srp-slide stagger-2">
                    {categories.map((cat, idx) => (
                        <div key={cat._id} className={`col-12 col-md-6 col-xl-4 animate-srp-slide stagger-${Math.min(idx + 3, 5)}`}>
                            <div className="srp-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '12px',
                                        background: 'var(--srp-grad-primary)', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                                    }}>
                                        <Zap size={20} fill="white" />
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            onClick={() => setModal({ mode: 'edit', category: cat })}
                                            className="btn-ghost-srp" style={{ width: '34px', height: '34px', backgroundColor: 'var(--srp-bg)' }}
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat._id, cat.name)}
                                            className="btn-ghost-srp" style={{ width: '34px', height: '34px', color: 'var(--srp-danger)', backgroundColor: 'var(--srp-bg)' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 800, color: 'var(--srp-text)' }}>{cat.name}</h3>
                                <p style={{
                                    margin: '0 0 24px', fontSize: '14px', color: 'var(--srp-text-muted)',
                                    lineHeight: 1.6, fontWeight: 500,
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                }}>
                                    {cat.description}
                                </p>

                                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--srp-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '28px', height: '28px', borderRadius: '8px',
                                                backgroundColor: 'var(--srp-bg)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Users size={14} className="text-primary" />
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--srp-text)' }}>
                                                {cat.assignedTechnicians.length} <span style={{ color: 'var(--srp-text-muted)', fontWeight: 500 }}>Technicians</span>
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', marginLeft: 'auto' }}>
                                            {cat.assignedTechnicians.slice(0, 3).map((tech, i) => (
                                                <div
                                                    key={tech._id}
                                                    style={{
                                                        width: '26px', height: '26px', borderRadius: '50%',
                                                        backgroundColor: 'var(--srp-primary)', color: 'white', border: '2px solid var(--srp-card-bg)',
                                                        marginLeft: i > 0 ? '-10px' : 0, display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '10px', fontWeight: 800, cursor: 'help',
                                                        boxShadow: 'var(--srp-shadow-sm)'
                                                    }}
                                                    title={tech.name}
                                                >
                                                    {tech.name.charAt(0)}
                                                </div>
                                            ))}
                                            {cat.assignedTechnicians.length > 3 && (
                                                <div style={{
                                                    width: '26px', height: '26px', borderRadius: '50%',
                                                    backgroundColor: 'var(--srp-border)', color: 'var(--srp-text-muted)',
                                                    border: '2px solid var(--srp-card-bg)',
                                                    marginLeft: '-10px', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontSize: '9px', fontWeight: 800
                                                }}>
                                                    +{cat.assignedTechnicians.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <div className="col-12">
                            <div className="srp-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <Zap size={40} color="var(--srp-border)" style={{ marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Categories Yet</h3>
                                <p style={{ color: 'var(--srp-text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
                                    Create your first dynamic category to start automatically assigning tickets to specialized technicians.
                                </p>
                                <button
                                    onClick={() => setModal({ mode: 'add' })}
                                    className="srp-btn srp-btn-primary"
                                >
                                    <Plus size={16} /> Create Category
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CategoryManagement;
