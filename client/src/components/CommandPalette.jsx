import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Search,
    LayoutDashboard,
    PlusCircle,
    ListTodo,
    Users,
    BarChart3,
    User,
    LogOut,
    Command,
    X,
    ChevronRight,
    Sparkles,
    Sun,
    Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const isAdmin = user?.role === 'admin';

    const actions = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', shortcut: 'D', category: 'Navigation', command: '/dash' },
        { name: 'Submit Request', icon: PlusCircle, path: '/submit-request', shortcut: 'N', category: 'Actions', hide: isAdmin, command: '/new' },
        { name: 'My Requests', icon: ListTodo, path: '/my-requests', shortcut: 'M', category: 'Navigation', hide: isAdmin, command: '/my' },
        { name: 'All Requests', icon: ListTodo, path: '/admin/requests', shortcut: 'A', category: 'Navigation', show: isAdmin, command: '/all' },
        { name: 'Manage Users', icon: Users, path: '/admin/users', shortcut: 'U', category: 'Administration', show: isAdmin, command: '/users' },
        { name: 'Reports', icon: BarChart3, path: '/reports', shortcut: 'R', category: 'Analytics', show: isAdmin, command: '/rep' },
        { name: 'Profile Settings', icon: User, path: '/profile', shortcut: 'P', category: 'Identity', command: '/prof' },
        {
            name: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`,
            icon: theme === 'light' ? Moon : Sun,
            action: toggleTheme,
            category: 'System',
            shortcut: 'T',
            command: '/theme'
        },
        { name: 'Sign Out', icon: LogOut, action: logout, category: 'Identity', danger: true, command: '/exit' },
    ].filter(a => (!a.show || isAdmin) && (!a.hide || !isAdmin));

    const filteredActions = query === ''
        ? actions
        : actions.filter(a =>
            a.name.toLowerCase().includes(query.toLowerCase()) ||
            (a.command && a.command.toLowerCase().includes(query.toLowerCase()))
        );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSelect = (action) => {
        if (action.path) navigate(action.path);
        if (action.action) action.action();
        setIsOpen(false);
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredActions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
        } else if (e.key === 'Enter') {
            handleSelect(filteredActions[selectedIndex]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-100 max-w-2xl srp-card srp-glass shadow-2xl overflow-hidden border-0 position-relative z-3"
                    >
                        <div className="p-4 border-bottom border-light d-flex align-items-center gap-4">
                            <Command size={24} className="text-primary animate-pulse" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search commands, navigate pages..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={onKeyDown}
                                className="flex-grow-1 bg-transparent border-0 shadow-none outline-none fs-5 fw-black text-dark placeholder:text-muted"
                                style={{ boxShadow: 'none' }}
                            />
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-light text-muted border py-2 px-2 fw-black" style={{ fontSize: '10px' }}>ESC</span>
                                <button onClick={() => setIsOpen(false)} className="btn btn-link text-muted p-2 shadow-none border-0 hover:bg-light rounded-3">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-2" style={{ maxHeight: '450px' }}>
                            {filteredActions.length === 0 ? (
                                <div className="py-5 text-center">
                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '64px', height: '64px' }}>
                                        <Search size={32} className="text-muted opacity-25" />
                                    </div>
                                    <p className="text-muted fw-bold">No results for "{query}"</p>
                                </div>
                            ) : (
                                <div className="p-3">
                                    {['Navigation', 'Actions', 'System', 'Administration', 'Analytics', 'Identity'].map(cat => {
                                        const catActions = filteredActions.filter(a => a.category === cat);
                                        if (catActions.length === 0) return null;

                                        return (
                                            <div key={cat} className="mb-4">
                                                <p className="text-uppercase fw-black text-muted small tracking-widest ms-3 mb-3" style={{ fontSize: '10px' }}>{cat}</p>
                                                <div className="d-flex flex-column gap-2">
                                                    {catActions.map((action) => {
                                                        const globalIndex = filteredActions.indexOf(action);
                                                        const isSelected = globalIndex === selectedIndex;

                                                        return (
                                                            <div
                                                                key={action.name}
                                                                onClick={() => handleSelect(action)}
                                                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                                className={`
                                                                    d-flex align-items-center justify-content-between p-3 rounded-4 cursor-pointer transition-all group
                                                                    ${isSelected ? 'bg-primary text-white shadow-lg translate-x-1' : 'text-muted hover:bg-light'}
                                                                `}
                                                            >
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <div className={`p-2 rounded-3 transition-all ${isSelected ? 'bg-white bg-opacity-20' : 'bg-light text-muted group-hover:bg-white group-hover:text-primary shadow-sm'}`}>
                                                                        <action.icon size={20} />
                                                                    </div>
                                                                    <span className="fw-bold small">{action.name}</span>
                                                                </div>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    {action.shortcut && (
                                                                        <span className={`badge rounded-3 text-uppercase fw-black tracking-widest px-2 py-1 ${isSelected ? 'bg-white bg-opacity-20 text-white' : 'bg-white bg-opacity-50 text-muted shadow-sm border'}`} style={{ fontSize: '9px' }}>
                                                                            {action.shortcut}
                                                                        </span>
                                                                    )}
                                                                    <ChevronRight size={16} className={`transition-all ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-light bg-opacity-50 d-flex align-items-center justify-content-between border-top border-light">
                            <div className="d-flex align-items-center gap-4 px-2">
                                <span className="d-flex align-items-center gap-2 text-uppercase fw-black text-muted small tracking-widest" style={{ fontSize: '9px' }}>
                                    <div className="bg-white border shadow-sm rounded px-1 fw-bold" style={{ minWidth: '20px', textAlign: 'center' }}>↑↓</div>
                                    Navigate
                                </span>
                                <span className="d-flex align-items-center gap-2 text-uppercase fw-black text-muted small tracking-widest" style={{ fontSize: '9px' }}>
                                    <div className="bg-white border shadow-sm rounded px-1 fw-bold" style={{ minWidth: '35px', textAlign: 'center' }}>ENTER</div>
                                    Select
                                </span>
                            </div>
                            <div className="d-flex align-items-center gap-2 text-primary px-2">
                                <Sparkles size={14} />
                                <span className="text-uppercase fw-black small tracking-widest" style={{ fontSize: '9px' }}>Powered by SRP Core</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
