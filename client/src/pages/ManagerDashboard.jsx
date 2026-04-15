import React, { useState } from 'react';
import api, { API_BASE_URL } from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    LayoutDashboard, Activity, AlertTriangle, CheckCircle2,
    Users, Clock, ChevronRight, ArrowRight, RefreshCw, BarChart,
    FileText, Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

import TeamPerformanceTable from '../components/TeamPerformanceTable';

/* ── Manager Dashboard Card ──────────────────────────────── */
const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="srp-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                backgroundColor: `${color}15`, color: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon size={24} />
            </div>
            {trend && (
                <span style={{ fontSize: '12px', fontWeight: 600, color: trend > 0 ? '#10B981' : '#EF4444' }}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800 }}>{value}</h3>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--srp-text-muted)', fontWeight: 500 }}>{title}</p>
    </div>
);

/* ── Manager Dashboard ──────────────────────────────────── */
const ManagerDashboard = () => {
    const queryClient = useQueryClient();
    const [reassigning, setReassigning] = useState(null); // ticketId

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['manager-analytics'],
        queryFn: async () => {
            const res = await api.get('/manager/analytics');
            return res.data.data;
        }
    });

    const { data: requests, isLoading: requestsLoading } = useQuery({
        queryKey: ['manager-requests'],
        queryFn: async () => {
            const res = await api.get('/manager/requests');
            return res.data.data;
        }
    });

    const { data: technicians, isLoading: techsLoading } = useQuery({
        queryKey: ['manager-technicians'],
        queryFn: async () => {
            const res = await api.get('/admin/users');
            const allUsers = res.data?.data || [];
            return Array.isArray(allUsers) ? allUsers.filter(u => u.role === 'technician') : [];
        }
    });

    const handleReassign = async (ticketId, techId) => {
        try {
            await api.put(`/manager/requests/${ticketId}/reassign`, { assignedTo: techId });
            queryClient.invalidateQueries(['manager-requests']);
            queryClient.invalidateQueries(['manager-analytics']);
            setReassigning(null);
        } catch (err) {
            alert('Failed to reassign ticket');
        }
    };

    if (analyticsLoading || requestsLoading || techsLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header */}
            <div>
                <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800 }}>Manager Dashboard</h1>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--srp-text-muted)' }}>
                    Operation oversight and team performance monitoring
                </p>
            </div>

            {/* Stats Grid */}
            <div className="row g-4">
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard title="Active Requests" value={analytics?.totalActive || 0} icon={Activity} color="#6366F1" />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard title="SLA Breaches" value={analytics?.slaBreaches || 0} icon={AlertTriangle} color="#EF4444" />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard title="Resolved (Overall)" value={(analytics?.techPerformance || []).reduce((acc, curr) => acc + curr.count, 0)} icon={CheckCircle2} color="#10B981" />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard title="Avg Resolution Time" value={`${Math.round((analytics?.techPerformance || []).reduce((acc, curr) => acc + (curr.avgResolutionTime || 0), 0) / (analytics?.techPerformance?.length || 1))}m`} icon={Clock} color="#F59E0B" trend={-12} />
                </div>
            </div>

            <div className="row g-4">
                {/* Team Performance Table */}
                <div className="col-12 col-xl-8">
                    <div className="srp-card" style={{ height: '100%', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--srp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Team Load & Performance</h3>
                            <Link to="/manager/performance" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--srp-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                View Full Report <ChevronRight size={14} />
                            </Link>
                        </div>
                        <TeamPerformanceTable technicians={technicians} analytics={analytics} />
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
                                        {Math.round((((analytics?.totalActive || 0) - (analytics?.slaBreaches || 0)) / (analytics?.totalActive || 1)) * 100)}%
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--srp-text-muted)' }}>In-SLA Targets</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--srp-text-muted)' }}>On Track</span>
                                    <span style={{ fontWeight: 700 }}>{(analytics?.totalActive || 0) - (analytics?.slaBreaches || 0)}</span>
                                </div>
                                <div style={{ height: '6px', backgroundColor: 'var(--srp-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', backgroundColor: 'var(--srp-primary)',
                                        width: `${(((analytics?.totalActive || 0) - (analytics?.slaBreaches || 0)) / (analytics?.totalActive || 1)) * 100}%`
                                    }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--srp-text-muted)' }}>Breached</span>
                                    <span style={{ fontWeight: 700, color: '#EF4444' }}>{analytics?.slaBreaches || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Tickets List */}
            <div className="srp-card">
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--srp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Active Requests Workforce</h3>
                </div>
                <div className="table-responsive">
                    <table className="srp-table border-0">
                        <thead>
                            <tr>
                                <th>Request</th>
                                <th>Category</th>
                                <th>Assigned To</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.slice(0, 10).map(ticket => (
                                <tr key={ticket._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flexGrow: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--srp-primary)' }}>{ticket.ticketNumber}</div>
                                                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--srp-text)', marginTop: '2px' }}>{ticket.title}</div>
                                            </div>
                                            {ticket.image && (
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '4px',
                                                    overflow: 'hidden', border: '1px solid var(--srp-border)',
                                                    backgroundColor: 'white', flexShrink: 0
                                                }}>
                                                    {ticket.image.toLowerCase().endsWith('.pdf') ? (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', color: '#EF4444' }}>
                                                            <FileText size={16} />
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={`${API_BASE_URL}/uploads/requests/${ticket.image.split(/[\\/]/).pop()}`}
                                                            alt=""
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '12px', color: 'var(--srp-text-muted)' }}>{ticket.category}</span>
                                    </td>
                                    <td>
                                        {reassigning === ticket._id ? (
                                            <select
                                                autoFocus
                                                onChange={(e) => handleReassign(ticket._id, e.target.value)}
                                                onBlur={() => setReassigning(null)}
                                                className="srp-input"
                                                style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                                            >
                                                <option value="">Select Tech</option>
                                                {(technicians || []).map(t => (
                                                    <option key={t._id} value={t._id}>{t.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div
                                                onClick={() => setReassigning(ticket._id)}
                                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <div style={{
                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                    backgroundColor: 'var(--srp-border)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center', fontSize: '10px'
                                                }}>
                                                    {ticket.assignedTo?.name?.charAt(0) || '?'}
                                                </div>
                                                <span style={{ fontSize: '12px' }}>{ticket.assignedTo?.name || 'Unassigned'}</span>
                                                <RefreshCw size={10} color="var(--srp-text-muted)" />
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge-status ${ticket.status === 'Open' ? 'badge-new' :
                                            ticket.status === 'Assigned' ? 'badge-medium' :
                                                ticket.status === 'In Progress' ? 'badge-in-progress' :
                                                    ticket.status === 'Waiting for User' ? 'badge-low' :
                                                        'badge-resolved'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <Link to={`/request/${ticket._id}`} className="btn-ghost-srp" style={{ width: '32px', height: '32px' }}>
                                            <ArrowRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
