import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
    Bell,
    Search,
    LogOut,
    ChevronDown,
    Sun,
    Moon,
    User as UserIcon,
    Settings
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import NotificationPanel from './NotificationPanel';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { notifications } = useNotifications();
    const { theme, toggleTheme } = useTheme();
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="srp-navbar">
            {/* Search */}
            <div style={{ flex: 1, maxWidth: '400px' }}>
                <div style={{ position: 'relative' }}>
                    <Search
                        size={15}
                        style={{
                            position: 'absolute', left: '12px', top: '50%',
                            transform: 'translateY(-50%)', color: 'var(--srp-text-light)'
                        }}
                    />
                    <input
                        type="text"
                        className="srp-input"
                        placeholder="Search or jump to... (Ctrl+K)"
                        readOnly
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' }))}
                        style={{ paddingLeft: '36px', cursor: 'pointer', fontSize: '13px' }}
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="btn-ghost-srp"
                    style={{ width: '36px', height: '36px' }}
                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
                >
                    {theme === 'light'
                        ? <Moon size={16} />
                        : <Sun size={16} color="#F59E0B" />
                    }
                </button>

                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className={`btn-ghost-srp ${isNotifOpen ? 'active' : ''}`}
                        style={{ width: '36px', height: '36px' }}
                        title="Notifications"
                    >
                        <Bell size={16} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: '6px', right: '6px',
                                width: '8px', height: '8px',
                                backgroundColor: 'var(--srp-danger)',
                                borderRadius: '50%',
                                border: '2px solid var(--srp-card-bg)'
                            }} />
                        )}
                    </button>
                    <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
                </div>

                {/* Divider */}
                <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--srp-border)' }} />

                {/* User Dropdown */}
                <div className="dropdown">
                    <button
                        className="srp-btn srp-btn-secondary d-flex align-items-center gap-2"
                        data-bs-toggle="dropdown"
                        style={{ padding: '6px 10px' }}
                    >
                        <div style={{
                            width: '28px', height: '28px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--srp-primary-light)',
                            color: 'var(--srp-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 700, flexShrink: 0
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="text-start d-none d-sm-block">
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--srp-text)', lineHeight: 1.2 }}>
                                {user?.name}
                            </p>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--srp-text-muted)', fontWeight: 500, textTransform: 'capitalize' }}>
                                {user?.role}
                            </p>
                        </div>
                        <ChevronDown size={13} style={{ color: 'var(--srp-text-light)' }} />
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end srp-card p-1 mt-2 shadow-lg" style={{ minWidth: '180px', border: '1px solid var(--srp-border)' }}>
                        <li>
                            <Link className="dropdown-item rounded d-flex align-items-center gap-2 py-2" style={{ fontSize: '13px', fontWeight: 500 }} to="/profile">
                                <UserIcon size={14} />
                                Profile
                            </Link>
                        </li>
                        <li><hr className="dropdown-divider my-1" style={{ borderColor: 'var(--srp-border)' }} /></li>
                        <li>
                            <button className="dropdown-item rounded d-flex align-items-center gap-2 py-2 text-danger" style={{ fontSize: '13px', fontWeight: 500 }} onClick={logout}>
                                <LogOut size={14} />
                                Sign Out
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
