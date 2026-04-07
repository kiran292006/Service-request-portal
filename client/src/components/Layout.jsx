import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Layout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--srp-bg)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: '28px', height: '28px', borderWidth: '3px' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--srp-text-muted)', fontWeight: 500 }}>Loading workspace...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--srp-bg)' }}>
            {/* Fixed Sidebar */}
            <div className="d-none d-lg-block" style={{ width: 'var(--srp-sidebar-width)', flexShrink: 0 }}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                <Navbar />
                <main style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto' }}>
                    <Outlet />
                </main>
                <footer style={{ padding: '1rem 2rem', borderTop: '1px solid var(--srp-border)', color: 'var(--srp-text-light)', fontSize: '12px', fontWeight: 500 }}>
                    © 2026 SRP · All rights reserved.
                </footer>
            </div>
        </div>
    );
};

export default Layout;
