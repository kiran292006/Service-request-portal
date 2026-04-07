import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    PlusCircle,
    ListTodo,
    BarChart3,
    Users,
    User,
    LogOut,
    Zap
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';
    const isTechnician = user?.role === 'technician';

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: isAdmin ? '/admin/dashboard' : (isManager ? '/manager/dashboard' : (isTechnician ? '/technician/dashboard' : '/dashboard')), category: 'Core' },
        { name: 'My Requests', icon: ListTodo, path: '/my-requests', category: 'Requests', hide: isAdmin || isManager || isTechnician },
        { name: 'Submit Request', icon: PlusCircle, path: '/submit-request', category: 'Requests', hide: isAdmin || isManager || isTechnician },
        { name: 'All Requests', icon: ListTodo, path: isAdmin ? '/admin/requests' : '/manager/requests', category: isAdmin ? 'Admin' : 'Operations', show: isAdmin || isManager },
        { name: 'Assigned Requests', icon: ListTodo, path: '/technician/tickets', category: 'Technician', show: isTechnician },
        { name: 'Reports', icon: BarChart3, path: isAdmin ? '/admin/reports' : '/manager/performance', category: isAdmin ? 'Admin' : 'Operations', show: isAdmin || isManager },
        { name: 'Manage Categories', icon: Zap, path: '/admin/categories', category: isAdmin ? 'Admin' : 'Operations', show: isAdmin || isManager },
        { name: 'Manage Users', icon: Users, path: '/admin/users', category: isAdmin ? 'Admin' : 'Operations', show: isAdmin || isManager },
        { name: 'Profile', icon: User, path: '/profile', category: 'Account' },
    ].filter(item => {
        if (item.show !== undefined && !item.show) return false;
        if (item.hide !== undefined && item.hide) return false;
        return true;
    });

    const categories = isAdmin
        ? ['Core', 'Admin', 'Account']
        : (isManager ? ['Core', 'Operations', 'Account'] : (isTechnician ? ['Core', 'Technician', 'Account'] : ['Core', 'Requests', 'Account']));

    return (
        <aside className="sidebar-nest d-none d-lg-flex flex-column" style={{ background: 'var(--srp-grad-surface)' }}>
            {/* Logo */}
            <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--srp-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px', height: '36px',
                        background: 'var(--srp-grad-primary)',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}>
                        <Zap size={18} color="white" strokeWidth={2.5} fill="white" />
                    </div>
                    <div className={"d-none d-lg-block"}>
                        <h6 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: 'var(--srp-text)', letterSpacing: '-0.04em' }}>SRP <span style={{ color: 'var(--srp-primary)', fontWeight: 400 }}>PORTAL</span></h6>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '24px 12px' }}>
                {categories.map(category => {
                    const items = menuItems.filter(i => i.category === category);
                    if (items.length === 0) return null;
                    return (
                        <div key={category} style={{ marginBottom: '1.25rem' }}>
                            <p style={{
                                margin: '0 0 4px 8px',
                                fontSize: '11px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--srp-text-light)'
                            }}>
                                {category}
                            </p>
                            {items.map(item => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`nav-link-srp${isActive ? ' active' : ''}`}
                                    >
                                        <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            {/* User Card + Sign Out */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid var(--srp-border)' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px', borderRadius: '8px', marginBottom: '4px',
                    backgroundColor: 'var(--srp-bg)'
                }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        backgroundColor: 'var(--srp-primary-light)',
                        color: 'var(--srp-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 700, flexShrink: 0
                    }}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--srp-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--srp-text-muted)', fontWeight: 500, textTransform: 'capitalize' }}>{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="nav-link-srp w-100 border-0 bg-transparent text-danger"
                    style={{ justifyContent: 'flex-start' }}
                >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
