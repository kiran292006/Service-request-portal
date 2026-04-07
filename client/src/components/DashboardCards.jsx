import React from 'react';
import { Clock, CheckCircle2, AlertCircle, RotateCcw, LayoutDashboard, X, TrendingUp } from 'lucide-react';
import { AnimatedCard } from './AnimationWrapper';

const colorMap = {
    blue: { bg: 'var(--srp-info-bg)', color: 'var(--srp-info)' },
    amber: { bg: 'var(--srp-warning-bg)', color: 'var(--srp-warning)' },
    indigo: { bg: 'var(--srp-accent-bg)', color: '#6366F1' },
    green: { bg: 'var(--srp-success-bg)', color: 'var(--srp-success)' },
    red: { bg: 'var(--srp-danger-bg)', color: 'var(--srp-danger)' },
    gray: { bg: 'var(--srp-bg-alt)', color: 'var(--srp-text-muted)' },
};

const StatCard = ({ title, count, icon: Icon, colorKey, desc, index }) => {
    const c = colorMap[colorKey] || colorMap.gray;
    return (
        <div className="col">
            <AnimatedCard delay={index * 0.05} h100>
                <div className="srp-card h-100" style={{ padding: '20px', border: '1px solid var(--srp-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            backgroundColor: c.bg, color: c.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Icon size={20} strokeWidth={2} />
                        </div>
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: 'var(--srp-text)', lineHeight: 1 }}>
                        {count}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--srp-text-muted)' }}>
                        {title}
                    </p>
                </div>
            </AnimatedCard>
        </div>
    );
};

const DashboardCards = ({ stats }) => {
    const cards = [
        { title: 'Total Requests', count: stats?.total || 0, icon: LayoutDashboard, colorKey: 'blue' },
        { title: 'Closed', count: stats?.closed || 0, icon: CheckCircle2, colorKey: 'green' },
        { title: 'Assigned', count: stats?.assigned || 0, icon: RotateCcw, colorKey: 'indigo' },
        { title: 'In Progress', count: stats?.inProgress || 0, icon: TrendingUp, colorKey: 'blue' },
        { title: 'Resolved', count: stats?.resolved || 0, icon: CheckCircle2, colorKey: 'green' },
        { title: 'SLA Breached', count: stats?.slaBreaches || 0, icon: AlertCircle, colorKey: 'red' },
    ];

    return (
        <div className="row row-cols-2 row-cols-md-3 row-cols-xl-6 g-3">
            {cards.map((card, idx) => (
                <StatCard key={card.title} {...card} index={idx} />
            ))}
        </div>
    );
};

export default DashboardCards;
