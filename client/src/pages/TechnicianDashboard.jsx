import React from 'react';
import { useAuth } from '../context/AuthContext';
import useRequests from '../hooks/useRequests';
import RequestTable from '../components/RequestTable';
import {
    ClipboardList, CheckCircle2, Clock, AlertCircle,
    Zap, Timer, Target, TrendingUp
} from 'lucide-react';
import { TableSkeleton } from '../components/Skeletons';
import { Link } from 'react-router-dom';
import { AnimatedCard } from '../components/AnimationWrapper';

const TechnicianDashboard = () => {
    const { user } = useAuth();
    const { useTechnicianTickets } = useRequests();
    const { data: ticketsData, isLoading } = useTechnicianTickets();

    const tickets = ticketsData?.data || [];
    const stats = [
        {
            label: 'Active Tasks',
            count: tickets.filter(t => ['Assigned', 'In Progress'].includes(t.status)).length,
            icon: ClipboardList,
            color: '#6366F1',
            desc: 'Requests awaiting action'
        },
        {
            label: 'In Progress',
            count: tickets.filter(t => t.status === 'In Progress').length,
            icon: Clock,
            color: '#F59E0B',
            desc: 'Currently working on'
        },
        {
            label: 'SLA Breaches',
            count: tickets.filter(t =>
                t.slaDeadline &&
                new Date(t.slaDeadline) < new Date() &&
                !['Resolved', 'Closed'].includes(t.status)
            ).length,
            icon: AlertCircle,
            color: '#EF4444',
            desc: 'Overdue resolutions'
        },
        {
            label: 'Completed',
            count: tickets.filter(t => ['Resolved', 'Closed'].includes(t.status)).length,
            icon: CheckCircle2,
            color: '#10B981',
            desc: 'Total resolved tickets'
        },
        {
            label: 'Experience Points',
            count: 0,
            icon: TrendingUp,
            color: '#8B5CF6',
            desc: 'System performance score'
        },
    ];

    if (isLoading) return <TableSkeleton />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '24px',
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                borderRadius: '20px',
                color: 'white',
                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Zap size={20} fill="white" />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Technician Command Center
                    </h1>
                </div>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '15px', fontWeight: 500 }}>
                    Welcome back, {user?.name}. You have {tickets.filter(t => t.status === 'Assigned').length} new tickets and <b>0 Performance Points</b>.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="row g-3 g-lg-4" style={{ marginBottom: '8px' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="col-6 col-md-4 col-xl">
                        <AnimatedCard delay={idx * 0.05}>
                            <div className="srp-card h-100" style={{
                                padding: '20px 16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: '1px solid var(--srp-border)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px',
                                        backgroundColor: `${stat.color}12`, color: stat.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <stat.icon size={22} />
                                    </div>
                                    <div style={{
                                        backgroundColor: 'var(--srp-bg-alt)',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        color: stat.color,
                                        letterSpacing: '0.04em',
                                        border: `1px solid ${stat.color}20`
                                    }}>
                                        {stat.label === 'Active Tasks' ? 'Workload' : 'Metric'}
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 900, color: 'var(--srp-text)', letterSpacing: '-0.02em' }}>{stat.count}</h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--srp-text)', fontWeight: 700 }}>{stat.label}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--srp-text-muted)', fontWeight: 500, lineHeight: 1.4 }}>{stat.desc}</p>
                                </div>
                            </div>
                        </AnimatedCard>
                    </div>
                ))}
            </div>

            {/* Quick Actions / Navigation */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px'
            }}>
                <Link to="/technician/tickets" className="srp-card group" style={{
                    padding: '32px', display: 'flex', alignItems: 'center', gap: '20px',
                    textDecoration: 'none', transition: 'all 0.3s ease', border: '1px solid var(--srp-border)'
                }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        backgroundColor: 'var(--srp-primary-light)', color: 'var(--srp-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <ClipboardList size={28} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--srp-text)' }}>Access Work Queue</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--srp-text-muted)', fontWeight: 500 }}>
                            View and manage your {tickets.length} assigned tickets.
                        </p>
                    </div>
                </Link>

                <div className="srp-card" style={{
                    padding: '32px', display: 'flex', alignItems: 'center', gap: '20px',
                    border: '1px solid var(--srp-border)', backgroundColor: 'var(--srp-bg)'
                }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        backgroundColor: '#10B98115', color: '#10B981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Target size={28} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--srp-text)' }}>Performance Tracker</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--srp-text-muted)', fontWeight: 500 }}>
                            Track your resolution metrics and SLA compliance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;
