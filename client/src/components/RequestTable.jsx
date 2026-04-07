import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Trash2, Paperclip, FileText } from 'lucide-react';
import { TableSkeleton } from './Skeletons';
import { useAuth } from '../context/AuthContext';
import useRequests from '../hooks/useRequests';

/* ── Badge Components ────────────────────────────────────── */
export const StatusBadge = ({ status }) => {
    const map = {
        'Pending': 'badge-pending',
        'Open': 'badge-pending',
        'Assigned': 'badge-progress',
        'In Progress': 'badge-progress',
        'Waiting for User': 'badge-medium',
        'Resolved': 'badge-resolved',
        'Rejected': 'badge-rejected',
        'Closed': 'badge-resolved',
    };
    return (
        <span className={`badge-status ${map[status] || ''}`}>
            {status}
        </span>
    );
};

export const PriorityBadge = ({ priority }) => {
    const map = {
        'Low': 'badge-low',
        'Medium': 'badge-medium',
        'High': 'badge-high',
        'Critical': 'badge-critical',
    };
    return (
        <span className={`badge-status ${map[priority] || 'badge-low'}`}>
            {priority}
        </span>
    );
};

/* ── Table ───────────────────────────────────────────────── */
const RequestTable = ({ requests, loading }) => {
    const { user } = useAuth();
    const { useDeleteRequest } = useRequests();
    const deleteMutation = useDeleteRequest();
    const isAdmin = user?.role === 'admin';

    const handleDelete = async (id) => {
        if (window.confirm('Delete this request? This cannot be undone.')) {
            try { await deleteMutation.mutateAsync(id); }
            catch (err) { console.error('Delete failed', err); }
        }
    };

    if (loading) return <TableSkeleton />;

    if (!requests || requests.length === 0) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '48px 24px', textAlign: 'center', minHeight: '240px'
            }}>
                <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    backgroundColor: 'var(--srp-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px'
                }}>
                    <Clock size={22} style={{ color: 'var(--srp-text-light)' }} />
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: 'var(--srp-text)' }}>No requests found</p>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--srp-text-muted)' }}>Requests will appear here once created.</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="srp-table">
                <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>Subject</th>
                        <th>Requester</th>
                        <th>Assigned To</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req) => (
                        <tr key={req._id}>
                            <td>
                                <span style={{
                                    fontFamily: 'monospace', fontSize: '12px',
                                    fontWeight: 600, color: 'var(--srp-text-muted)'
                                }}>
                                    {req.ticketNumber}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '280px' }}>
                                    <span style={{
                                        fontWeight: 500, color: 'var(--srp-text)',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                    }}>
                                        {req.title}
                                    </span>
                                    {req.image && (
                                        req.image.toLowerCase().endsWith('.pdf') ? (
                                            <div style={{
                                                padding: '4px', borderRadius: '4px',
                                                backgroundColor: '#FEF2F2', color: '#EF4444',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }} title="PDF Document">
                                                <FileText size={12} />
                                            </div>
                                        ) : (
                                            <div style={{
                                                width: '24px', height: '24px', borderRadius: '4px',
                                                overflow: 'hidden', border: '1px solid var(--srp-border)',
                                                backgroundColor: 'white', flexShrink: 0
                                            }}>
                                                <img
                                                    src={`http://localhost:5000/uploads/requests/${req.image.split(/[\\/]/).pop()}`}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '6px',
                                        backgroundColor: 'var(--srp-primary-light)',
                                        color: 'var(--srp-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '11px', fontWeight: 700
                                    }}>
                                        {req.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--srp-text)' }}>
                                        {req.userId?.name || 'Unknown'}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <div style={{ fontSize: '13px' }}>
                                    <div style={{ fontWeight: 500, color: 'var(--srp-text)' }}>
                                        {req.assignedTo?.name || <span style={{ color: 'var(--srp-text-muted)', fontStyle: 'italic' }}>Unassigned</span>}
                                    </div>
                                    {req.assignedBy && (
                                        <div style={{ fontSize: '11px', color: 'var(--srp-text-muted)' }}>
                                            by {req.assignedBy}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td>
                                <span style={{ fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                                    {req.category}
                                </span>
                            </td>
                            <td><PriorityBadge priority={req.priority} /></td>
                            <td><StatusBadge status={req.status} /></td>
                            <td>
                                <span style={{ fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                                    {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                    <Link
                                        to={`/request/${req._id}`}
                                        className="btn-ghost-srp"
                                        style={{ width: '32px', height: '32px', borderRadius: '6px' }}
                                        title="View Details"
                                    >
                                        <ArrowRight size={15} />
                                    </Link>
                                    {(isAdmin || user?.role === 'manager') && (
                                        <button
                                            onClick={() => handleDelete(req._id)}
                                            className="btn-ghost-srp"
                                            style={{ width: '32px', height: '32px', borderRadius: '6px', color: 'var(--srp-danger)' }}
                                            title="Delete"
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RequestTable;
