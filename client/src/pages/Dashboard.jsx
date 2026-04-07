import React from 'react';
import useRequests from '../hooks/useRequests';
import { useAuth } from '../context/AuthContext';
import DashboardCards from '../components/DashboardCards';
import RequestTable from '../components/RequestTable';
import { Plus, Calendar, ArrowRight, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CardSkeleton } from '../components/Skeletons';
import TeamPerformanceTable from '../components/TeamPerformanceTable';
import api from '../services/api';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
    const { user } = useAuth();
    const { useMyRequests, useAnalytics } = useRequests();
    const isAdmin = user?.role === 'admin';

    const { data: userData, isLoading: userLoading } = useMyRequests({ enabled: !isAdmin });
    const { data: adminData, isLoading: adminLoading } = useAnalytics({ enabled: isAdmin });

    const requests = isAdmin
        ? (adminData?.data?.recentRequests || [])
        : (userData?.data || []);

    const isLoading = isAdmin ? adminLoading : userLoading;

    // Fetch technicians for Admin Team Performance section
    const { data: technicians } = useQuery({
        queryKey: ['admin-technicians'],
        enabled: isAdmin,
        queryFn: async () => {
            const res = await api.get('/admin/users');
            const allUsers = res.data?.data || [];
            return Array.isArray(allUsers) ? allUsers.filter(u => u.role === 'technician') : [];
        }
    });

    const userStats = !isAdmin && Array.isArray(userData?.data) ? {
        total: userData.data.length,
        pending: userData.data.filter(r => r.status === 'Pending').length,
        inProgress: userData.data.filter(r => r.status === 'In Progress').length,
        resolved: userData.data.filter(r => r.status === 'Resolved').length,
        closed: userData.data.filter(r => r.status === 'Closed').length,
        rejected: userData.data.filter(r => r.status === 'Rejected').length,
        critical: userData.data.filter(r => r.priority === 'Critical').length
    } : { total: 0, pending: 0, inProgress: 0, resolved: 0, closed: 0, rejected: 0, critical: 0 };

    const stats = isAdmin ? (adminData?.data || {}) : userStats;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: 'var(--srp-text)' }}>
                        {isAdmin ? 'Admin Overview' : `Welcome back, ${user?.name?.split(' ')[0] || 'User'}`}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--srp-text-muted)', fontSize: '13px' }}>
                        <Calendar size={13} />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        <span style={{ color: 'var(--srp-border)' }}>·</span>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '2px 8px', borderRadius: '9999px',
                            backgroundColor: isAdmin ? 'var(--srp-warning-bg)' : 'var(--srp-info-bg)',
                            color: isAdmin ? 'var(--srp-warning)' : 'var(--srp-info)',
                            fontSize: '11px', fontWeight: 600, textTransform: 'capitalize'
                        }}>
                            {user?.role}
                        </span>
                    </div>
                </div>
                {!isAdmin && (
                    <Link to="/submit-request" className="srp-btn srp-btn-primary">
                        <Plus size={16} />
                        New Request
                    </Link>
                )}
            </div>

            {/* Stats Cards */}
            {isLoading ? (
                <div className="row row-cols-2 row-cols-md-3 row-cols-xl-6 g-3">
                    {[...Array(6)].map((_, i) => (
                        <div className="col" key={i}><CardSkeleton /></div>
                    ))}
                </div>
            ) : (
                <DashboardCards stats={stats} />
            )}

            {/* Recent Requests Table */}
            <div>
                {isAdmin && (
                    <div className="row g-4 mb-5">
                        {/* Team Performance Table */}
                        <div className="col-12 col-xl-8">
                            <div className="srp-card" style={{ height: '100%', overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--srp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--srp-primary-light)', color: 'var(--srp-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Team Load & Performance</h3>
                                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--srp-text-muted)' }}>Real-time technician throughput and rating metrics</p>
                                        </div>
                                    </div>
                                    <Link to="/manager/performance" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--srp-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        View Full Analytics <ChevronRight size={14} />
                                    </Link>
                                </div>
                                <TeamPerformanceTable technicians={technicians} analytics={adminData?.data?.data} />
                            </div>
                        </div>

                        {/* SLA Summary */}
                        <div className="col-12 col-xl-4">
                            <div className="srp-card" style={{ height: '100%', overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--srp-border)' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>SLA Compliance</h3>
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <div style={{ position: 'relative', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--srp-primary)' }}>
                                                {Math.round((((stats?.totalActive || 0) - (stats?.slaBreaches || 0)) / (stats?.totalActive || 1)) * 100)}%
                                            </div>
                                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--srp-text-muted)' }}>In-SLA Targets</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                            <span style={{ color: 'var(--srp-text-muted)' }}>On Track</span>
                                            <span style={{ fontWeight: 700 }}>{(stats?.totalActive || 0) - (stats?.slaBreaches || 0)}</span>
                                        </div>
                                        <div style={{ height: '6px', backgroundColor: 'var(--srp-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', backgroundColor: 'var(--srp-primary)',
                                                width: `${(((stats?.totalActive || 0) - (stats?.slaBreaches || 0)) / (stats?.totalActive || 1)) * 100}%`
                                            }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                            <span style={{ color: 'var(--srp-text-muted)' }}>Breached</span>
                                            <span style={{ fontWeight: 700, color: '#EF4444' }}>{stats?.slaBreaches || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 600, color: 'var(--srp-text)' }}>
                            Recent Requests
                        </h2>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                            Latest requests and their current status
                        </p>
                    </div>
                    <Link
                        to={isAdmin ? '/admin/requests' : '/my-requests'}
                        className="srp-btn srp-btn-secondary"
                        style={{ fontSize: '13px' }}
                    >
                        View All
                        <ArrowRight size={14} />
                    </Link>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <RequestTable requests={requests} loading={isLoading} />
                </div>
            </div>

            {/* Empty State */}
            {!isLoading && (!requests || requests.length === 0) && (
                <div style={{
                    textAlign: 'center', padding: '48px 24px',
                    border: '2px dashed var(--srp-border)', borderRadius: 'var(--srp-radius-md)',
                    backgroundColor: 'var(--srp-card-bg)'
                }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        backgroundColor: 'var(--srp-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                    }}>
                        <Plus size={24} style={{ color: 'var(--srp-text-light)' }} />
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: 'var(--srp-text)' }}>
                        No requests yet
                    </p>
                    <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                        Create your first service request to get started.
                    </p>
                    {!isAdmin && (
                        <Link to="/submit-request" className="srp-btn srp-btn-primary">
                            Create Request
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
