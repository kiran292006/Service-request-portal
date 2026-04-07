import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Trash2, CheckCircle, Info, AlertTriangle, ShieldAlert, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NotificationPanel = ({ isOpen, onClose }) => {
    const { notifications, markAsRead, markAllRead, clearNotifications, deleteNotification } = useNotifications();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    const getIcon = (type) => {
        const iconStyle = { 
            width: '32px', height: '32px', borderRadius: '8px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
        };
        switch (type) {
            case 'success':
            case 'resolved': return <div style={{ ...iconStyle, backgroundColor: '#ECFDF5' }}><CheckCircle size={16} className="text-success" /></div>;
            case 'warning':
            case 'sla_warning': return <div style={{ ...iconStyle, backgroundColor: '#FFFBEB' }}><AlertTriangle size={16} className="text-warning" /></div>;
            case 'error': return <div style={{ ...iconStyle, backgroundColor: '#FEF2F2' }}><ShieldAlert size={16} className="text-danger" /></div>;
            case 'status_change': return <div style={{ ...iconStyle, backgroundColor: isDark ? '#1e293b' : '#F0F9FF' }}><Info size={16} className="text-primary" /></div>;
            default: return <div style={{ ...iconStyle, backgroundColor: isDark ? '#1e293b' : '#F0F9FF' }}><Bell size={16} className="text-primary" /></div>;
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(date).toLocaleDateString();
    };

    const handleNotifClick = (notif) => {
        if (!notif.read) markAsRead(notif._id);
        if (notif.requestId) {
            navigate(`/request/${notif.requestId}`);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Panel (Dropdown Style) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="shadow-2xl z-[2001] d-flex flex-column"
                        style={{ 
                            position: 'absolute',
                            top: '100%',
                            right: '0',
                            marginTop: '12px',
                            width: '380px', 
                            maxWidth: '90vw',
                            maxHeight: '480px',
                            overflow: 'hidden',
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${isDark ? '#334155' : 'var(--srp-border)'}`,
                            transformOrigin: 'top right',
                            borderRadius: '16px'
                        }}
                    >
                        {/* Header */}
                        <div className="p-3 d-flex align-items-center justify-content-between border-bottom" style={{ borderColor: isDark ? '#334155' : '#f1f5f9' }}>
                            <div className="d-flex align-items-center gap-2">
                                <div className={`rounded-3 p-1.5 ${isDark ? 'bg-slate-800' : 'bg-primary bg-opacity-10'}`}>
                                    <Bell size={18} className="text-primary" />
                                </div>
                                <div className="text-start">
                                    <h6 className={`fw-bold m-0 ${isDark ? 'text-white' : 'text-dark'}`} style={{ fontSize: '14px' }}>Notifications</h6>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Wipe all notifications? This cannot be undone.')) {
                                            clearNotifications();
                                        }
                                    }} 
                                    className="btn-ghost-srp px-2 py-1 text-danger fw-bold" 
                                    style={{ fontSize: '11px', transition: 'all 0.2s' }}
                                >
                                    CLEAR ALL
                                </button>
                                <button onClick={markAllRead} className="btn-ghost-srp p-1.5 text-primary" title="Mark all read">
                                    <CheckCircle size={16} />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto p-2" style={{ backgroundColor: isDark ? '#0f172a' : 'var(--srp-bg-alt)' }}>
                            {notifications.length === 0 ? (
                                <div className="py-5 d-flex flex-column align-items-center justify-content-center text-center">
                                    <Bell size={24} className="text-muted opacity-30 mb-2" />
                                    <p className="text-muted small m-0">No new notifications</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-2">
                                    {notifications.map((n) => (
                                        <motion.div
                                            key={n._id}
                                            layout
                                            className={`p-3 transition-all cursor-pointer ${n.read ? 'opacity-60' : 'shadow-sm'}`}
                                            style={{ 
                                                position: 'relative',
                                                borderRadius: '12px',
                                                backgroundColor: n.read ? 'transparent' : (isDark ? '#1e293b' : 'white'),
                                                border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`
                                            }}
                                            onClick={() => handleNotifClick(n)}
                                        >
                                            {!n.read && (
                                                <div style={{
                                                    position: 'absolute', left: '0', top: '12px', bottom: '12px',
                                                    width: '3px', backgroundColor: 'var(--srp-primary)',
                                                    borderRadius: '0 4px 4px 0'
                                                }} />
                                            )}
                                            <div className="d-flex gap-3">
                                                <div className="shrink-0">
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="text-start flex-grow-1 pe-4">
                                                    <p className={`mb-1 ${n.read ? '' : 'fw-bold'}`} style={{ fontSize: '13px', lineHeight: 1.4, color: isDark ? '#f8fafc' : 'var(--srp-text)' }}>
                                                        {n.message}
                                                    </p>
                                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                                        <span className="text-muted fw-bold" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                                                            {timeAgo(n.createdAt)}
                                                        </span>
                                                        {n.requestId && (
                                                            <span className="text-primary fw-bold" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                VIEW <ExternalLink size={10} />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(n._id);
                                                    }}
                                                    className="btn-ghost-srp p-1 position-absolute top-0 end-0 mt-2 me-2 opacity-50 hover-opacity-100"
                                                    title="Delete"
                                                >
                                                    <X size={14} className={isDark ? 'text-slate-400' : 'text-muted'} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {notifications.length > 0 && (
                            <div className="p-2 border-top text-center" style={{ borderColor: isDark ? '#334155' : '#f1f5f9' }}>
                                <button onClick={onClose} className="btn-ghost-srp w-100 py-1 text-muted small fw-bold">CLOSE</button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
