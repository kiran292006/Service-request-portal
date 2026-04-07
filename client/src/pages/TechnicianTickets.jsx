import React from 'react';
import useRequests from '../hooks/useRequests';
import RequestTable from '../components/RequestTable';
import { ClipboardList, LayoutDashboard } from 'lucide-react';
import { TableSkeleton } from '../components/Skeletons';
import { Link } from 'react-router-dom';

const TechnicianRequests = () => {
    const { useTechnicianTickets } = useRequests();
    const { data: ticketsData, isLoading } = useTechnicianTickets();

    const tickets = ticketsData?.data || [];

    if (isLoading) return <TableSkeleton />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '32px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                borderRadius: '24px',
                color: 'white',
                boxShadow: 'var(--srp-shadow-lg)'
            }}>
                <div>
                    <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em' }}>
                        My Work Queue
                    </h1>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: '15px', fontWeight: 500 }}>
                        Manage and resolve your assigned service requests.
                    </p>
                </div>
                <Link
                    to="/technician/dashboard"
                    className="srp-btn"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    <LayoutDashboard size={18} /> Dashboard
                </Link>
            </div>

            {/* Table Card */}
            <div className="srp-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--srp-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--srp-bg)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            padding: '8px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--srp-primary-light)',
                            color: 'var(--srp-primary)'
                        }}>
                            <ClipboardList size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Assigned Requests</h3>
                    </div>
                    <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: 'var(--srp-bg)',
                        border: '1px solid var(--srp-border)',
                        fontSize: '12px',
                        color: 'var(--srp-text-muted)',
                        fontWeight: 700
                    }}>
                        {tickets.length} TOTAL
                    </div>
                </div>
                <RequestTable requests={tickets} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default TechnicianRequests;
