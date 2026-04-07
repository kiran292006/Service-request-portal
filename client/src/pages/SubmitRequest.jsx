import React, { useState } from 'react';
import useRequests from '../hooks/useRequests';
import { useNavigate } from 'react-router-dom';
import {
    Send, Upload, X, AlertCircle, FileText, Tag, BarChart, ChevronLeft
} from 'lucide-react';
import { AnimatedButton } from '../components/AnimationWrapper';

const SubmitRequest = () => {
    const navigate = useNavigate();
    const { useCreateRequest, useCategories } = useRequests();
    const submitMutation = useCreateRequest();

    // Fetch categories
    const { data: catData, isLoading: catLoading } = useCategories();
    const categories = catData?.data || [];

    const [form, setForm] = useState({ title: '', category: '', priority: 'Medium', description: '' });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleImageChange = e => {
        const file = e.target.files[0];
        if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
    };

    const handleDrop = e => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
            setImage(file); setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');

        if (!form.category) {
            setError('Please select a category for your request.');
            return;
        }

        const formData = new FormData();
        Object.keys(form).forEach(k => formData.append(k, form[k]));
        if (image) formData.append('image', image);

        try {
            await submitMutation.mutateAsync(formData);
            navigate('/my-requests');
        } catch (err) {
            console.error('Submission failed', err);
            setError(err.response?.data?.error || 'Failed to submit request. Please try again.');
        }
    };

    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const priorityColors = {
        Low: { active: 'var(--srp-bg-alt)', border: 'var(--srp-border)', text: 'var(--srp-text-muted)' },
        Medium: { active: 'var(--srp-info-bg)', border: 'var(--srp-info)', text: 'var(--srp-info)' },
        High: { active: 'var(--srp-warning-bg)', border: 'var(--srp-warning)', text: 'var(--srp-warning)' },
        Critical: { active: 'var(--srp-danger-bg)', border: 'var(--srp-danger)', text: 'var(--srp-danger)' },
    };

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--srp-text-muted)', fontSize: '13px', fontWeight: 500, padding: 0, marginBottom: '12px' }}
                >
                    <ChevronLeft size={15} /> Back
                </button>
                <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: 'var(--srp-text)' }}>
                    Create New Request
                </h1>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--srp-text-muted)' }}>
                    Describe your issue and we'll route it to the right team.
                </p>
            </div>

            {error && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 16px', borderRadius: 'var(--srp-radius)',
                    backgroundColor: 'var(--srp-danger-bg)', border: '1px solid var(--srp-danger)',
                    marginBottom: '20px', fontSize: '14px', color: 'var(--srp-danger)',
                    fontWeight: 500
                }}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Details Card */}
                        <div className="srp-card" style={{ padding: '24px' }}>
                            <h2 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 600, color: 'var(--srp-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={16} style={{ color: 'var(--srp-primary)' }} />
                                Request Details
                            </h2>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--srp-text)', marginBottom: '6px' }}>
                                    Title <span style={{ color: 'var(--srp-danger)' }}>*</span>
                                </label>
                                <input
                                    type="text" name="title"
                                    className="srp-input"
                                    placeholder="Brief summary of the issue"
                                    required value={form.title}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--srp-text)', marginBottom: '6px' }}>
                                    Description <span style={{ color: 'var(--srp-danger)' }}>*</span>
                                </label>
                                <textarea
                                    name="description"
                                    className="srp-input"
                                    placeholder="Provide as much detail as possible..."
                                    required
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={8}
                                    style={{ resize: 'vertical', minHeight: '160px' }}
                                />
                            </div>
                        </div>

                        {/* Attachment Card */}
                        <div className="srp-card" style={{ padding: '24px' }}>
                            <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: 'var(--srp-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Upload size={16} style={{ color: 'var(--srp-primary)' }} />
                                Attachment
                                <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--srp-text-muted)' }}>Optional</span>
                            </h2>

                            {!preview ? (
                                <div
                                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    style={{
                                        border: `2px dashed ${isDragging ? 'var(--srp-primary)' : 'var(--srp-border)'}`,
                                        borderRadius: 'var(--srp-radius)',
                                        padding: '32px',
                                        textAlign: 'center',
                                        backgroundColor: isDragging ? 'var(--srp-primary-light)' : 'var(--srp-bg)',
                                        transition: 'all 0.15s ease',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                >
                                    <Upload size={24} style={{ color: 'var(--srp-text-light)', margin: '0 auto 8px' }} />
                                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 500, color: 'var(--srp-text)' }}>
                                        Drop files here, or <span style={{ color: 'var(--srp-primary)' }}>browse</span>
                                    </p>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--srp-text-muted)' }}>JPG, PNG, PDF — up to 5MB</p>
                                    <label style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
                                        <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={handleImageChange} />
                                    </label>
                                </div>
                            ) : (
                                <div style={{ position: 'relative', borderRadius: 'var(--srp-radius)', overflow: 'hidden', border: '1px solid var(--srp-border)' }}>
                                    <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', display: 'block' }} />
                                    <button
                                        type="button" onClick={() => { setImage(null); setPreview(null); }}
                                        style={{
                                            position: 'absolute', top: '8px', right: '8px',
                                            background: 'white', border: '1px solid var(--srp-border)',
                                            borderRadius: '6px', width: '28px', height: '28px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: 'var(--srp-text-muted)'
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column — Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="srp-card" style={{ padding: '20px' }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: 'var(--srp-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Tag size={14} style={{ color: 'var(--srp-primary)' }} />
                                Settings
                            </h3>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--srp-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Category
                                </label>
                                <select
                                    name="category"
                                    className="srp-input"
                                    value={form.category}
                                    onChange={handleChange}
                                    style={{ cursor: 'pointer' }}
                                    disabled={catLoading}
                                >
                                    {catLoading ? (
                                        <option>Loading categories...</option>
                                    ) : categories.length > 0 ? (
                                        <>
                                            <option value="">Select a category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                            ))}
                                            <option value="Other">Other</option>
                                        </>
                                    ) : (
                                        <option value="Other">Other</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--srp-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Priority
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    {priorities.map(p => {
                                        const c = priorityColors[p];
                                        const isActive = form.priority === p;
                                        return (
                                            <button
                                                key={p} type="button"
                                                onClick={() => setForm({ ...form, priority: p })}
                                                style={{
                                                    padding: '8px 4px', border: `1px solid ${isActive ? c.border : 'var(--srp-border)'}`,
                                                    borderRadius: 'var(--srp-radius)',
                                                    backgroundColor: isActive ? c.active : 'var(--srp-card-bg)',
                                                    color: isActive ? c.text : 'var(--srp-text-muted)',
                                                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease'
                                                }}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* SLA Notice */}
                        <div style={{
                            padding: '16px', borderRadius: 'var(--srp-radius-md)',
                            backgroundColor: 'var(--srp-info-bg)', border: '1px solid var(--srp-info)'
                        }}>
                            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: 'var(--srp-info)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <AlertCircle size={13} />
                                SLA Notice
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--srp-text)', lineHeight: 1.5, opacity: 0.8 }}>
                                <strong>Critical</strong>: 4hr · <strong>High</strong>: 24hr · <strong>Medium</strong>: 48hr · <strong>Low</strong>: 72hr
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitMutation.isPending}
                            className="srp-btn srp-btn-primary"
                            style={{ width: '100%', padding: '12px' }}
                        >
                            {submitMutation.isPending ? 'Submitting...' : 'Submit Request'}
                            {!submitMutation.isPending && <Send size={15} />}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SubmitRequest;
