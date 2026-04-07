import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AnimatedButton } from '../components/AnimationWrapper';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Could not create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-dot-pattern" style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'var(--srp-bg)', padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
                {/* Branding */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        backgroundColor: 'var(--srp-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)'
                    }}>
                        <Shield size={24} color="white" strokeWidth={2.5} />
                    </div>
                    <h1 style={{ 
                        margin: '0 0 8px', fontSize: '26px', fontWeight: 900, 
                        color: 'var(--srp-text)', letterSpacing: '-0.04em'
                    }}>
                        Create Account
                    </h1>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--srp-text-muted)', fontWeight: 500 }}>
                        Join SRP to manage requests professionally.
                    </p>
                </div>

                {/* Compact Auth Card */}
                <div style={{ 
                    backgroundColor: 'var(--srp-glass-bg)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    padding: '32px', 
                    borderRadius: '20px',
                    border: '1px solid var(--srp-border)',
                    boxShadow: 'var(--srp-shadow-lg)'
                }}>
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px', borderRadius: '10px',
                            backgroundColor: 'var(--srp-danger-bg)', border: '1px solid var(--srp-danger)',
                            marginBottom: '24px', fontSize: '13px', color: 'var(--srp-danger)',
                            fontWeight: 600
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                                display: 'block', fontSize: '12px', fontWeight: 700, 
                                color: '#475569', marginBottom: '6px', textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                            }}>
                                Full Name
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--srp-text-light)' }} />
                                <input
                                    type="text"
                                    className="srp-input"
                                    placeholder=""
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ 
                                        paddingLeft: '42px', height: '44px', borderRadius: '12px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                                display: 'block', fontSize: '12px', fontWeight: 700, 
                                color: '#475569', marginBottom: '6px', textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                            }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--srp-text-light)' }} />
                                <input
                                    type="email"
                                    className="srp-input"
                                    placeholder=""
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{ 
                                        paddingLeft: '42px', height: '44px', borderRadius: '12px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ 
                                display: 'block', fontSize: '12px', fontWeight: 700, 
                                color: '#475569', marginBottom: '6px', textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--srp-text-light)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="srp-input"
                                    placeholder=""
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    style={{ 
                                        paddingLeft: '42px', paddingRight: '42px', height: '44px', 
                                        borderRadius: '12px', fontSize: '14px'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--srp-text-light)', padding: '4px' }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <AnimatedButton
                            type="submit"
                            disabled={loading}
                            className="srp-btn srp-btn-primary w-100"
                            style={{ 
                                height: '46px', borderRadius: '12px', fontSize: '14px', 
                                fontWeight: 800, display: 'flex', alignItems: 'center', 
                                justifyContent: 'center', gap: '8px',
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)'
                            }}
                        >
                            {loading ? (
                                <div className="spinner-border spinner-border-sm" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </AnimatedButton>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '14px', color: 'var(--srp-text-muted)', fontWeight: 500 }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--srp-primary)', fontWeight: 800, textDecoration: 'none' }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
