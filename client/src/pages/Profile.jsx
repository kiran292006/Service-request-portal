import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    User, Mail, ShieldCheck, Lock, LogOut,
    Bell, Key, ChevronRight, Pencil, AlertCircle, Eye, EyeOff
} from 'lucide-react';

/* ── Change Password Modal ───────────────────────────────── */
const ChangePasswordModal = ({ onClose }) => {
    const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.newPw !== form.confirm) { setError('New passwords do not match.'); return; }
        if (form.newPw.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setSaving(true);
        // TODO: wire to /api/auth/change-password when endpoint exists
        setTimeout(() => { setSaving(false); setSuccess(true); }, 800);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '16px'
        }}>
            <div className="srp-card" style={{ width: '100%', maxWidth: '400px', padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--srp-text)' }}>Update Password</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--srp-text-muted)', padding: '4px' }}>✕</button>
                </div>

                {success ? (
                    <div style={{
                        textAlign: 'center', padding: '24px 0',
                        color: 'var(--srp-success)', fontSize: '14px', fontWeight: 600
                    }}>
                        ✓ Password updated successfully!
                        <button onClick={onClose} className="srp-btn srp-btn-primary" style={{ display: 'block', margin: '16px auto 0', width: '100%' }}>Done</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', marginBottom: '14px', fontSize: '13px', color: '#991B1B' }}>
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}
                        {[
                            { key: 'current', label: 'Current Password' },
                            { key: 'newPw', label: 'New Password' },
                            { key: 'confirm', label: 'Confirm New Password' },
                        ].map(({ key, label }) => (
                            <div key={key} style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--srp-text)', marginBottom: '5px' }}>{label}</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--srp-text-light)' }} />
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        className="srp-input"
                                        placeholder="••••••••"
                                        required
                                        value={form[key]}
                                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                                        style={{ paddingLeft: '30px', paddingRight: '36px' }}
                                    />
                                    {key === 'newPw' && (
                                        <button type="button" onClick={() => setShowPw(!showPw)}
                                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--srp-text-light)' }}>
                                            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                            <button type="button" onClick={onClose} className="srp-btn srp-btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button type="submit" disabled={saving} className="srp-btn srp-btn-primary" style={{ flex: 1 }}>
                                {saving ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

/* ── Main Profile Page ───────────────────────────────────── */
const Profile = () => {
    const { user, logout } = useAuth();
    const [showPwModal, setShowPwModal] = useState(false);
    const [notifications, setNotifications] = useState(true);

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    const isAdmin = user?.role === 'admin';

    const InfoRow = ({ label, value, children }) => (
        <div style={{ padding: '14px 0', borderBottom: '1px solid var(--srp-border)' }}>
            <p style={{ margin: '0 0 3px', fontSize: '12px', fontWeight: 500, color: 'var(--srp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </p>
            {children || (
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: 'var(--srp-text)' }}>{value}</p>
            )}
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}

            {/* Page Header */}
            <div style={{ marginBottom: '16px' }}>
                <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: 'var(--srp-text)' }}>
                    Profile &amp; Settings
                </h1>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                    Manage your account information and security preferences
                </p>
            </div>

            {/* 3-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}>

                {/* ── Left: Profile Card ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="srp-card" style={{ padding: '24px', textAlign: 'center' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            backgroundColor: 'var(--srp-primary-light)',
                            color: 'var(--srp-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '24px', fontWeight: 700,
                            margin: '0 auto 16px',
                            border: '3px solid var(--srp-border)'
                        }}>
                            {initials}
                        </div>

                        {/* Name */}
                        <h2 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: 'var(--srp-text)' }}>
                            {user?.name}
                        </h2>

                        {/* Role badge */}
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '4px 12px',
                            borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                            backgroundColor: isAdmin ? '#DBEAFE' : '#D1FAE5',
                            color: isAdmin ? '#1D4ED8' : '#065F46',
                        }}>
                            <ShieldCheck size={13} />
                            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                        </span>

                        <div style={{ borderTop: '1px solid var(--srp-border)', marginTop: '20px', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="srp-btn srp-btn-primary" style={{ width: '100%' }}>
                                Save Profile <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={logout}
                                style={{
                                    width: '100%', padding: '8px', border: '1px solid #FECACA',
                                    borderRadius: 'var(--srp-radius)', backgroundColor: '#FEF2F2',
                                    color: '#991B1B', fontSize: '13px', fontWeight: 600,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                }}
                            >
                                <LogOut size={14} /> Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Email quick-view */}
                    <div className="srp-card" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--srp-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Mail size={15} style={{ color: 'var(--srp-text-light)' }} />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ margin: '0 0 1px', fontSize: '11px', color: 'var(--srp-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</p>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--srp-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Content ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Account Info Card */}
                    <div className="srp-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={16} style={{ color: '#4F46E5' }} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--srp-text)' }}>Account Information</h3>
                            </div>
                            <button className="btn-ghost-srp" style={{ width: '32px', height: '32px', borderRadius: '8px' }} title="Edit profile">
                                <Pencil size={14} />
                            </button>
                        </div>
                        <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--srp-text-muted)' }}>Your personal details and access level</p>

                        <InfoRow label="Full Name" value={user?.name} />
                        <InfoRow label="Email Address" value={user?.email} />
                        <InfoRow label="Authorization Role">
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '4px',
                                padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                                backgroundColor: isAdmin ? '#DBEAFE' : '#D1FAE5',
                                color: isAdmin ? '#1D4ED8' : '#065F46',
                            }}>
                                <ShieldCheck size={12} />
                                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                            </span>
                        </InfoRow>
                        <InfoRow label="Account Status">
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '4px',
                                padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                                backgroundColor: '#D1FAE5', color: '#065F46',
                            }}>
                                ● Active
                            </span>
                        </InfoRow>
                    </div>

                    {/* Security Card */}
                    <div className="srp-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Key size={16} style={{ color: '#D97706' }} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--srp-text)' }}>Security &amp; Access</h3>
                        </div>
                        <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--srp-text-muted)' }}>Manage your password and security settings</p>

                        {/* Password row */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px', borderRadius: 'var(--srp-radius-md)',
                            backgroundColor: 'var(--srp-bg)', border: '1px solid var(--srp-border)', gap: '12px', flexWrap: 'wrap'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'white', border: '1px solid var(--srp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Lock size={16} style={{ color: 'var(--srp-text-muted)' }} />
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 600, color: 'var(--srp-text)' }}>Access Password</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--srp-text-muted)' }}>Last updated 92 days ago</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPwModal(true)}
                                className="srp-btn srp-btn-primary"
                                style={{ padding: '8px 16px', fontSize: '13px', flexShrink: 0 }}
                            >
                                Update Password
                            </button>
                        </div>
                    </div>

                    {/* Notifications Card */}
                    <div className="srp-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bell size={16} style={{ color: '#16A34A' }} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--srp-text)' }}>Notifications</h3>
                        </div>
                        <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--srp-text-muted)' }}>Control when and how you receive alerts</p>

                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px', borderRadius: 'var(--srp-radius-md)',
                            backgroundColor: 'var(--srp-bg)', border: '1px solid var(--srp-border)'
                        }}>
                            <div>
                                <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 600, color: 'var(--srp-text)' }}>Status Change Alerts</p>
                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--srp-text-muted)' }}>Get notified when your request status updates</p>
                            </div>
                            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                <input
                                    type="checkbox"
                                    checked={notifications}
                                    onChange={() => setNotifications(!notifications)}
                                    style={{ display: 'none' }}
                                />
                                <div style={{
                                    width: '44px', height: '24px', borderRadius: '12px', transition: 'background 0.2s',
                                    backgroundColor: notifications ? 'var(--srp-primary)' : '#D1D5DB',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute', top: '2px',
                                        left: notifications ? '22px' : '2px',
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        backgroundColor: 'white', transition: 'left 0.2s ease',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                    }} />
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
