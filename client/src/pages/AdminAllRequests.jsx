import React, { useState } from 'react';
import useRequests from '../hooks/useRequests';
import RequestTable from '../components/RequestTable';
import KanbanBoard from '../components/KanbanBoard';
import { Search, LayoutList, LayoutGrid, X } from 'lucide-react';

const AdminAllRequests = () => {
    const [view, setView] = useState('table');
    const [filters, setFilters] = useState({ status: '', priority: '', category: '', search: '' });

    const { useAllRequests } = useRequests();
    const { data: requestsData, isLoading } = useAllRequests(filters);

    const handleFilterChange = e => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const clearFilters = () => setFilters({ status: '', priority: '', category: '', search: '' });
    const hasFilters = Object.values(filters).some(v => v !== '');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: 'var(--srp-text)' }}>All Requests</h1>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                        Manage and triage all portal requests
                    </p>
                </div>

                {/* View Toggle */}
                <div style={{
                    display: 'flex', gap: '4px', padding: '4px',
                    backgroundColor: 'var(--srp-bg)', borderRadius: 'var(--srp-radius)',
                    border: '1px solid var(--srp-border)'
                }}>
                    {[
                        { id: 'table', Icon: LayoutList, label: 'Table' },
                        { id: 'kanban', Icon: LayoutGrid, label: 'Kanban' },
                    ].map(({ id, Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setView(id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '6px 12px', border: 'none', borderRadius: '6px',
                                cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.15s ease',
                                backgroundColor: view === id ? 'var(--srp-card-bg)' : 'transparent',
                                color: view === id ? 'var(--srp-text)' : 'var(--srp-text-muted)',
                                boxShadow: view === id ? 'var(--srp-shadow-sm)' : 'none'
                            }}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {view === 'table' ? (
                <div className="srp-card" style={{ overflow: 'hidden' }}>
                    {/* Filter Bar */}
                    <div style={{
                        padding: '16px 20px', borderBottom: '1px solid var(--srp-border)',
                        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'
                    }}>
                        {/* Search */}
                        <div style={{ position: 'relative', flex: '1 1 260px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--srp-text-light)' }} />
                            <input
                                type="text" name="search"
                                className="srp-input"
                                placeholder="Search by request ID or title..."
                                value={filters.search}
                                onChange={handleFilterChange}
                                style={{ paddingLeft: '32px', fontSize: '13px' }}
                            />
                        </div>

                        {/* Dropdowns */}
                        {[
                            { name: 'status', options: ['Open', 'Assigned', 'In Progress', 'Waiting for User', 'Resolved', 'Closed'], placeholder: 'All Statuses' },
                            { name: 'priority', options: ['Low', 'Medium', 'High', 'Critical'], placeholder: 'All Priorities' },
                            { name: 'category', options: ['Technical', 'Hardware', 'Software', 'Network', 'Infrastructure', 'Billing', 'Account', 'Other'], placeholder: 'All Categories' },
                        ].map(({ name, options, placeholder }) => (
                            <select
                                key={name} name={name}
                                className="srp-input"
                                value={filters[name]}
                                onChange={handleFilterChange}
                                style={{ width: 'auto', minWidth: '140px', cursor: 'pointer', fontSize: '13px' }}
                            >
                                <option value="">{placeholder}</option>
                                {options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        ))}

                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    padding: '7px 12px', border: '1px solid var(--srp-border)',
                                    borderRadius: 'var(--srp-radius)', backgroundColor: 'var(--srp-card-bg)',
                                    cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'var(--srp-text-muted)'
                                }}
                            >
                                <X size={13} /> Clear
                            </button>
                        )}
                    </div>

                    <RequestTable requests={requestsData?.data} loading={isLoading} />
                </div>
            ) : (
                <KanbanBoard requests={requestsData?.data} isLoading={isLoading} />
            )}
        </div>
    );
};

export default AdminAllRequests;
