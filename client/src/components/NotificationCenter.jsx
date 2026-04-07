import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const NotificationCenter = () => {
    const { user, socket } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        fetchNotifications();

        if (socket) {
            socket.on('notification', (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                // Play subtle sound or show toast here if desired
            });
        }

        return () => {
            if (socket) socket.off('notification');
        };
    }, [socket]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const removeNotif = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                    background: 'none', border: 'none', padding: '8px', cursor: 'pointer',
                    color: 'var(--srp-text)', position: 'relative', display: 'flex', alignItems: 'center'
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '4px', right: '4px',
                        backgroundColor: '#EF4444', color: 'white', fontSize: '10px',
                        padding: '2px 5px', borderRadius: '10px', fontWeight: 800,
                        border: '2px solid white'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div
                    className="srp-card shadow-lg"
                    style={{
                        position: 'absolute', top: '100%', right: 0, width: '320px',
                        marginTop: '10px', zIndex: 100, maxHeight: '420px', display: 'flex', flexDirection: 'column'
                    }}
                >
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--srp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Notifications</h4>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} style={{ fontSize: '11px', color: 'var(--srp-primary)', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>
                                Mark all as read
                            </button>
                        )}
                        <button onClick={() => setShowDropdown(false)} style={{ border: 'none', background: 'none' }}><X size={14} /></button>
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--srp-text-muted)', fontSize: '13px' }}>
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    style={{
                                        padding: '12px 16px', borderBottom: '1px solid var(--srp-border)',
                                        backgroundColor: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                                        display: 'flex', gap: '12px', transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', color: 'var(--srp-text)', fontWeight: n.read ? 400 : 600, marginBottom: '4px' }}>
                                            {n.message}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', color: 'var(--srp-text-muted)' }}>
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {!n.read && (
                                                    <button onClick={() => markRead(n._id)} title="Mark as read" style={{ border: 'none', background: 'none', color: '#10B981' }}><Check size={14} /></button>
                                                )}
                                                <button onClick={() => removeNotif(n._id)} title="Delete" style={{ border: 'none', background: 'none', color: '#EF4444' }}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        {n.requestId && (
                                            <Link
                                                to={`/request/${n.requestId}`}
                                                onClick={() => { setShowDropdown(false); markRead(n._id); }}
                                                style={{ fontSize: '11px', color: 'var(--srp-primary)', fontWeight: 600, display: 'block', marginTop: '6px' }}
                                            >
                                                View Request
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
