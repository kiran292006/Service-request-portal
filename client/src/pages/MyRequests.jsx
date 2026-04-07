import React, { useState } from 'react';
import useRequests from '../hooks/useRequests';
import RequestTable from '../components/RequestTable';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyRequests = () => {
    const { useMyRequests } = useRequests();
    const { data, isLoading } = useMyRequests();
    const [activeFilter, setActiveFilter] = useState('All');

    const statuses = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

    const filteredRequests = activeFilter === 'All'
        ? (data?.data || [])
        : (data?.data || []).filter(r => r.status === activeFilter);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: 'var(--srp-text)' }}>My Requests</h1>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                        Track and manage your submitted service requests
                    </p>
                </div>
                <Link to="/submit-request" className="srp-btn srp-btn-primary">
                    <Plus size={16} /> New Request
                </Link>
            </div>

            {/* Content Card */}
            <div className="srp-card" style={{ overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderBottom: '1px solid var(--srp-border)', flexWrap: 'wrap', gap: '12px'
                }}>
                    {/* Filter Tabs */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {statuses.map(s => (
                            <button
                                key={s}
                                onClick={() => setActiveFilter(s)}
                                style={{
                                    padding: '6px 12px', border: 'none', borderRadius: 'var(--srp-radius)',
                                    cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.15s ease',
                                    backgroundColor: activeFilter === s ? 'var(--srp-primary-light)' : 'transparent',
                                    color: activeFilter === s ? 'var(--srp-primary)' : 'var(--srp-text-muted)',
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--srp-text-light)' }} />
                        <input
                            type="text" className="srp-input"
                            placeholder="Search requests..."
                            style={{ paddingLeft: '32px', width: '220px', fontSize: '13px' }}
                        />
                    </div>
                </div>

                <RequestTable requests={filteredRequests} loading={isLoading} />
            </div>
        </div>
    );
};

export default MyRequests;
