import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCircle, Info, AlertTriangle, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Toast = ({ notification }) => {
    const { removeToast, markAsRead } = useNotifications();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(notification.id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [notification.id, removeToast]);

    const getIcon = (type) => {
        switch (type) {
            case 'success':
            case 'resolved': return <CheckCircle size={18} style={{ color: 'var(--srp-success)' }} />;
            case 'warning':
            case 'sla_warning': return <AlertTriangle size={18} style={{ color: 'var(--srp-warning)' }} />;
            case 'reassigned': return <Bell size={18} style={{ color: 'var(--srp-info)' }} />;
            default: return <Info size={18} style={{ color: 'var(--srp-primary)' }} />;
        }
    };

    const handleClick = () => {
        if (notification.requestId) {
            markAsRead(notification._id);
            navigate(`/request/${notification.requestId}`);
        }
        removeToast(notification.id);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="srp-card mb-2"
            style={{ 
                width: '320px', 
                padding: '16px', 
                backgroundColor: 'var(--srp-glass-bg)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid var(--srp-border)',
                borderLeft: '4px solid var(--srp-primary)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                pointerEvents: 'auto'
            }}
        >
            <div className="d-flex gap-3">
                <div className="mt-1">{getIcon(notification.type)}</div>
                <div className="flex-grow-1">
                    <p className="m-0 fw-bold" style={{ fontSize: '13px', color: 'var(--srp-text)' }}>New Update</p>
                    <p className="m-0" style={{ fontSize: '12px', lineHeight: 1.4, color: 'var(--srp-text-muted)' }}>{notification.message}</p>
                    {notification.requestId && (
                        <button 
                            onClick={handleClick}
                            className="btn-ghost-srp p-0 mt-2 d-flex align-items-center gap-1"
                            style={{ 
                                fontSize: '11px', fontWeight: 700, 
                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                color: 'var(--srp-primary)'
                            }}
                        >
                            View Intel <ExternalLink size={10} />
                        </button>
                    )}
                </div>
                <button 
                    onClick={() => removeToast(notification.id)}
                    className="btn-ghost-srp p-1"
                    style={{ height: 'fit-content', color: 'var(--srp-text-muted)' }}
                >
                    <X size={14} />
                </button>
            </div>
        </motion.div>
    );
};

const ToastContainer = () => {
    const { toasts } = useNotifications();

    return (
        <div 
            style={{ 
                position: 'fixed', 
                top: '24px', 
                right: '24px', 
                zIndex: 9999, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-end',
                pointerEvents: 'none'
            }}
        >
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast key={toast.id} notification={toast} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
