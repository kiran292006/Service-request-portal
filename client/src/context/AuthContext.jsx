import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await authService.getMe();
                    setUser(res.data);
                } catch (err) {
                    console.error('Failed to load user', err);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        const res = await authService.login(email, password);
        const userRes = await authService.getMe();
        setUser(userRes.data);
        return { ...res, user: userRes.data };
    };

    const register = async (userData) => {
        const res = await authService.register(userData);
        const userRes = await authService.getMe();
        setUser(userRes.data);
        return { ...res, user: userRes.data };
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
