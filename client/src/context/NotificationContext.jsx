import { useEffect, useState, useContext, createContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api, { API_BASE_URL } from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [socket, setSocket] = useState(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    }, [user?._id]);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        fetchNotifications();

        let active = true;
        const newSocket = io(API_BASE_URL, {
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            transports: ['websocket', 'polling'],
        });

        newSocket.connect();
        setSocket(newSocket);

        newSocket.on('connect', () => {
            if (active) newSocket.emit('join', user._id);
        });

        newSocket.on('notification', (notification) => {
            if (active) {
                setNotifications(prev => [notification, ...prev]);
                // Trigger Toast
                setToasts(prev => [...prev, { ...notification, id: Date.now() }]);
            }
        });

        return () => {
            active = false;
            newSocket.disconnect();
        };
    }, [user?._id, fetchNotifications]);

    const markAsRead = async (id) => {
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

    const clearNotifications = async () => {
        try {
            await api.delete('/notifications/clear/all');
            setNotifications([]);
            // Add success toast
            setToasts(prev => [...prev, { 
                id: Date.now(), 
                message: 'All signals cleared successfully.', 
                type: 'success' 
            }]);
        } catch (err) {
            console.error('Logic Breakdown: Failed to wipe notifications', err);
            const errorMsg = err.response?.data?.error || 'System unavailable.';
            setToasts(prev => [...prev, { 
                id: Date.now(), 
                message: `Failed: ${errorMsg}`, 
                type: 'error' 
            }]);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            toasts,
            setToasts,
            markAsRead,
            markAllRead,
            clearNotifications,
            deleteNotification,
            fetchNotifications,
            removeToast
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
