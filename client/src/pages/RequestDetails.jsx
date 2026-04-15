import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useRequests from '../hooks/useRequests';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { StatusBadge, PriorityBadge } from '../components/RequestTable';
import api, { API_BASE_URL } from '../services/api';
import {
    ArrowLeft, Calendar, User, Paperclip, FileText, ChevronDown,
    Trash2, Tag, Clock, CheckCircle2, Circle, XCircle, ExternalLink,
    Download, Users, MessageSquare, Send, AlertTriangle, History, Zap,
    Plus, RefreshCw
} from 'lucide-react';
import { DetailsSkeleton } from '../components/Skeletons';
import FeedbackForm from '../components/FeedbackForm';
/* ── SLA Timer Component ────────────────────────────────── */
const SLA_HOURS = { Critical: 4, High: 8, Medium: 12, Low: 24 };

const SLATimer = ({ deadline, status, priority }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [percent, setPercent] = useState(100);
    const [isBreached, setIsBreached] = useState(false);

    useEffect(() => {
        if (!deadline || ['Resolved', 'Closed'].includes(status)) return;

        const totalHours = SLA_HOURS[priority] || 24;

        const updateTimer = () => {
            const end = new Date(deadline).getTime();
            const start = end - (totalHours * 60 * 60 * 1000);
            const now = new Date().getTime();
            const total = end - start;
            const remaining = end - now;

            if (remaining <= 0) {
                setTimeLeft('SLA Breached');
                setPercent(0);
                setIsBreached(true);
            } else {
                const h = Math.floor(remaining / (1000 * 60 * 60));
                const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${h}h ${m}m remaining`);
                setPercent(Math.max(0, (remaining / total) * 100));
                setIsBreached(false);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [deadline, status]);

    if (!deadline || ['Resolved', 'Closed'].includes(status)) return null;

    const color = isBreached ? '#EF4444' : percent < 25 ? '#F59E0B' : '#6366F1';

    return (
        <div className="srp-card" style={{ padding: '20px', borderLeft: `4px solid ${color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color={color} />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--srp-text)' }}>SLA Countdown</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: color }}>{timeLeft}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--srp-border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%', backgroundColor: color, width: `${percent}%`,
                    transition: 'width 1s ease-in-out'
                }} />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--srp-text-muted)', fontWeight: 500 }}>
                {isBreached ? 'This ticket has exceeded its resolution target.' : 'Resolution target based on ticket priority.'}
            </p>
        </div>
    );
};

/* ── Activity Timeline Item ──────────────────────────────── */
const TimelineItem = ({ activity, isLast }) => {
    const getIcon = (action) => {
        if (action.includes('Created')) return { icon: Plus, color: '#10B981' };
        if (action.includes('Assigned')) return { icon: User, color: '#6366F1' };
        if (action.includes('Status')) return { icon: RefreshCw, color: '#F59E0B' };
        if (action.includes('Resolved')) return { icon: CheckCircle2, color: '#10B981' };
        if (action.includes('Comment')) return { icon: MessageSquare, color: '#3B82F6' };
        return { icon: Circle, color: 'var(--srp-text-muted)' };
    };

    const { icon: Icon, color } = getIcon(activity.action);

    return (
        <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: `${color}15`, color: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${color}30`, zIndex: 1
                }}>
                    <Icon size={14} />
                </div>
                {!isLast && <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--srp-border)', margin: '4px 0' }} />}
            </div>
            <div style={{ paddingBottom: isLast ? 0 : '24px', paddingTop: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--srp-text)', marginBottom: '2px' }}>{activity.action}</div>
                <div style={{ fontSize: '12px', color: 'var(--srp-text-muted)', marginBottom: '6px' }}>
                    {new Date(activity.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {activity.details && (
                    <div style={{ fontSize: '12px', color: 'var(--srp-text-light)', backgroundColor: 'var(--srp-bg)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--srp-border)' }}>
                        {activity.details}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Main Component ─────────────────────────────────────── */
const RequestDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { setToasts } = useNotifications();
    const navigate = useNavigate();
    const { useRequest, useDeleteRequest, useUpdateStatus, useComments, useAddComment, useTicketActivity, useUsers } = useRequests();

    const { data: requestData, isLoading: requestLoading, error: requestError, refetch: refetchRequest } = useRequest(id);
    const { data: commentsData } = useComments(id);
    const { data: activityData } = useTicketActivity(id);
    const { data: usersData } = useUsers({ enabled: user?.role === 'admin' || user?.role === 'manager' });

    const addCommentMutation = useAddComment();
    const deleteMutation = useDeleteRequest();
    const updateStatusMutation = useUpdateStatus();

    const [comment, setComment] = useState('');
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showTechMenu, setShowTechMenu] = useState(false);
    const [resolutionRemarks, setResolutionRemarks] = useState('');
    const [showResolutionForm, setShowResolutionForm] = useState(false);

    const request = requestData?.data;
    const comments = commentsData?.data || [];
    const activities = activityData?.data || [];
    const technicians = usersData?.data?.filter(u => u.role === 'technician') || [];

    // Handle 404 — ticket was deleted or doesn't exist
    const isNotFound = requestError?.response?.status === 404;

    if (isNotFound) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '40px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--srp-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid var(--srp-border)' }}>
                    <FileText size={28} style={{ color: 'var(--srp-text-light)' }} />
                </div>
                <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800 }}>Request Not Found</h2>
                <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--srp-text-muted)', maxWidth: '360px' }}>
                    This ticket no longer exists. It may have been deleted or the link may be incorrect.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="srp-btn srp-btn-primary"
                >
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        );
    }


    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';
    const isTechnician = user?.role === 'technician' && (request?.assignedTo?._id || request?.assignedTo) === user?._id;
    const isCreator = (request?.userId?._id || request?.userId) === user?._id;
    const canChangeStatus = isAdmin || isManager || isTechnician || (isCreator && request?.status === 'Resolved');

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            try {
                await deleteMutation.mutateAsync(id);
                navigate(isAdmin ? '/admin/requests' : (isManager ? '/manager/requests' : '/my-requests'));
            } catch (err) { console.error(err); }
        }
    };

    const getAvailableStatuses = () => {
        if (isAdmin || isManager) return ['Open', 'Assigned', 'In Progress', 'Waiting for User', 'Resolved', 'Closed', 'Rejected'];
        if (isTechnician) return ['In Progress', 'Waiting for User', 'Resolved'];
        if (isCreator && request?.status === 'Resolved') return ['Closed', 'Reopened'];
        return [];
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            await addCommentMutation.mutateAsync({ ticketId: id, message: comment });
            setComment('');
        } catch (err) { console.error(err); }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (newStatus === 'Resolved') {
            setShowResolutionForm(true);
            setShowStatusMenu(false);
        } else {
            try {
                await updateStatusMutation.mutateAsync({ id, statusData: { status: newStatus } });
                setToasts(prev => [...prev, { 
                    id: Date.now(), 
                    message: `Status: ${newStatus}`, 
                    type: 'success' 
                }]);
                setShowStatusMenu(false);
            } catch (err) {
                const errMsg = err.response?.data?.error || 'Update failed.';
                setToasts(prev => [...prev, { 
                    id: Date.now(), 
                    message: `Error: ${errMsg}`, 
                    type: 'error' 
                }]);
            }
        }
    };

    const submitResolution = async () => {
        try {
            await updateStatusMutation.mutateAsync({
                id, statusData: { status: 'Resolved', resolutionRemarks }
            });
            setToasts(prev => [...prev, { 
                id: Date.now(), 
                message: 'Ticket successfully resolved', 
                type: 'success' 
            }]);
            setShowResolutionForm(false);
            setShowStatusMenu(false);
        } catch (err) {
            setToasts(prev => [...prev, { 
                id: Date.now(), 
                message: 'Resolution failed', 
                type: 'error' 
            }]);
        }
    };

    if (requestLoading) return <DetailsSkeleton />;
    if (!request) return <div className="text-center py-5">Request not found.</div>;

    const fileUrl = request.image ? `${API_BASE_URL}/uploads/requests/${request.image.split(/[\\/]/).pop()}` : null;
    const isPdf = request.image?.toLowerCase().endsWith('.pdf');

    const availableStatuses = getAvailableStatuses();

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header / Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to={isAdmin ? '/admin/requests' : (isManager ? '/manager/requests' : (isTechnician ? '/technician/dashboard' : '/my-requests'))} className="btn-ghost-srp" style={{ fontSize: '13px', fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back to List
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--srp-text-muted)' }}>TICKET ID</span>
                    <span style={{ padding: '4px 12px', borderRadius: '6px', backgroundColor: 'var(--srp-primary)', color: 'white', fontWeight: 800, fontSize: '13px' }}>{request.ticketNumber}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Primary Info Card */}
                    <div className="srp-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div style={{ flex: 1 }}>
                                <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800, color: 'var(--srp-text)' }}>{request.title}</h1>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                                        <Calendar size={14} /> Submitted {new Date(request.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                                        <User size={14} /> By {request.userId?.name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--srp-text-muted)' }}>
                                        <Tag size={14} /> {request.category}
                                    </div>
                                </div>
                            </div>

                            {canChangeStatus && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="srp-btn srp-btn-secondary" style={{ gap: '8px' }}>
                                            <StatusBadge status={request.status} /> <ChevronDown size={14} />
                                        </button>
                                        {showStatusMenu && (
                                            <div className="srp-glass shadow-lg" style={{ 
                                                position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
                                                width: '200px', zIndex: 100, padding: '8px',
                                                borderRadius: '12px', border: '1px solid var(--srp-border)',
                                                boxShadow: 'var(--srp-shadow-lg)'
                                            }}>
                                                {availableStatuses.map(s => {
                                                    const isActive = request.status === s;
                                                    return (
                                                        <button 
                                                            key={s} 
                                                            onClick={() => handleStatusUpdate(s)} 
                                                            className={`btn-ghost-srp w-100 mb-1 ${updateStatusMutation.isPending ? 'disabled' : ''}`}
                                                            disabled={updateStatusMutation.isPending}
                                                            style={{ 
                                                                textAlign: 'left', border: 'none', 
                                                                background: isActive ? 'var(--srp-primary-light)' : 'transparent',
                                                                color: isActive ? 'var(--srp-primary)' : 'var(--srp-text)',
                                                                fontSize: '13px', padding: '10px 14px',
                                                                borderRadius: '8px', fontWeight: isActive ? 700 : 500,
                                                                transition: 'all 0.2s ease',
                                                                justifyContent: 'flex-start'
                                                            }}
                                                        >
                                                            {s} {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', marginLeft: 'auto' }} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    {(isAdmin || isManager) && (
                                        <div style={{ position: 'relative' }}>
                                            <button onClick={() => setShowTechMenu(!showTechMenu)} className="srp-btn srp-btn-secondary" title="Reassign">
                                                <Users size={16} />
                                            </button>
                                            {showTechMenu && (
                                                <div className="srp-glass shadow-lg animate-srp-fade" style={{ 
                                                    position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
                                                    width: '260px', zIndex: 10, padding: '8px', 
                                                    maxHeight: '280px', overflowY: 'auto',
                                                    borderRadius: '16px', border: '1px solid var(--srp-border)'
                                                }}>
                                                    <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--srp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Techs</div>
                                                    {technicians.map(t => (
                                                        <button 
                                                            key={t._id} 
                                                            onClick={async () => {
                                                                try {
                                                                    await api.put(`/manager/requests/${id}/reassign`, { assignedTo: t._id });
                                                                    setToasts(prev => [...prev, { 
                                                                        id: Date.now(), 
                                                                        message: `Ticket reassigned to ${t.name}`, 
                                                                        type: 'success' 
                                                                    }]);
                                                                    setShowTechMenu(false);
                                                                    refetchRequest();
                                                                } catch (err) {
                                                                    setToasts(prev => [...prev, { 
                                                                        id: Date.now(), 
                                                                        message: 'Reassignment failed', 
                                                                        type: 'error' 
                                                                    }]);
                                                                }
                                                            }} 
                                                            className="btn-ghost-srp w-100 mb-1" 
                                                            style={{ 
                                                                textAlign: 'left', border: 'none', background: 'transparent',
                                                                fontSize: '13px', display: 'flex', gap: '10px', alignItems: 'center',
                                                                padding: '8px 12px', borderRadius: '10px', transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            <div style={{ 
                                                                width: '24px', height: '24px', borderRadius: '50%', 
                                                                background: 'var(--srp-primary-light)', color: 'var(--srp-primary)', 
                                                                fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontWeight: 700
                                                            }}>
                                                                {t.name.charAt(0)}
                                                            </div>
                                                            <div style={{ flex: 1, color: 'var(--srp-text)', fontWeight: 500 }}>{t.name}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ backgroundColor: 'var(--srp-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--srp-border)', marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: 'var(--srp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issue Description</h4>
                            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: 'var(--srp-text)', whiteSpace: 'pre-wrap' }}>{request.description}</p>
                        </div>

                        {request.resolutionRemarks && (
                            <div style={{ backgroundColor: 'var(--srp-primary-light)', padding: '24px', borderRadius: '12px', borderLeft: '4px solid var(--srp-primary)', marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: 'var(--srp-primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={15} /> Success Resolution</h4>
                                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, fontWeight: 500, color: 'var(--srp-text)' }}>{request.resolutionRemarks}</p>
                            </div>
                        )}

                        {showResolutionForm && (
                            <div className="srp-card" style={{ padding: '24px', backgroundColor: 'var(--srp-bg)', marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700 }}>Final Resolution Remarks</h4>
                                <textarea className="srp-input" rows="4" value={resolutionRemarks} onChange={e => setResolutionRemarks(e.target.value)} placeholder="Provide final solution details..."></textarea>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setShowResolutionForm(false)} className="srp-btn srp-btn-secondary">Cancel</button>
                                    <button onClick={submitResolution} className="srp-btn srp-btn-primary">Resolve Request</button>
                                </div>
                            </div>
                        )}

                        {fileUrl && (
                            <div>
                                <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: 'var(--srp-text-muted)', textTransform: 'uppercase' }}>Attachments</h4>
                                {isPdf ? (
                                    <a href={fileUrl} target="_blank" rel="noreferrer" className="srp-btn srp-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={16} /> View PDF Document
                                    </a>
                                ) : (
                                    <img src={fileUrl} alt="Request evidence" style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid var(--srp-border)', boxShadow: 'var(--srp-shadow-sm)', cursor: 'zoom-in' }} onClick={() => window.open(fileUrl, '_blank')} />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Conversation Section */}
                    <div className="srp-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--srp-primary-light)', color: 'var(--srp-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={20} /></div>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Conversation</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                            {comments.map(c => {
                                const isMe = c.userId === user?._id;
                                return (
                                    <div key={c._id} style={{
                                        display: 'flex',
                                        gap: '12px',
                                        flexDirection: isMe ? 'row-reverse' : 'row',
                                        alignItems: 'flex-start'
                                    }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            backgroundColor: isMe ? 'var(--srp-primary)' : 'var(--srp-border)',
                                            color: isMe ? 'white' : 'var(--srp-text)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, fontSize: '11px', flexShrink: 0,
                                            boxShadow: 'var(--srp-shadow-sm)'
                                        }}>
                                            {c.userName.charAt(0)}
                                        </div>
                                        <div style={{
                                            maxWidth: '75%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: isMe ? 'flex-end' : 'flex-start'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '4px',
                                                flexDirection: isMe ? 'row-reverse' : 'row'
                                            }}>
                                                <span style={{ fontSize: '13px', fontWeight: 700 }}>{isMe ? 'You' : c.userName}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--srp-text-muted)' }}>
                                                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div style={{
                                                padding: '12px 16px',
                                                borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                                backgroundColor: isMe ? 'var(--srp-primary-light)' : 'var(--srp-bg)',
                                                color: 'var(--srp-text)',
                                                fontSize: '14px',
                                                lineHeight: 1.6,
                                                border: '1px solid var(--srp-border)',
                                                boxShadow: 'var(--srp-shadow-sm)',
                                                textAlign: isMe ? 'right' : 'left'
                                            }}>
                                                {c.message}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {comments.length === 0 && <p style={{ textAlign: 'center', color: 'var(--srp-text-muted)', fontSize: '14px', padding: '20px' }}>No messages yet. Start the conversation!</p>}
                        </div>

                        <form onSubmit={handleAddComment}>
                            <div style={{ position: 'relative' }}>
                                <textarea className="srp-input" rows="3" placeholder="Type your message here..." value={comment} onChange={e => setComment(e.target.value)} style={{ paddingRight: '120px' }}></textarea>
                                <button type="submit" disabled={addCommentMutation.isPending} className="srp-btn srp-btn-primary" style={{ position: 'absolute', bottom: '12px', right: '12px', padding: '8px 16px' }}>
                                    <Send size={14} /> Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Feedback Form (If Resolved/Closed and not yet submitted, for Creator only) */}
                    {isCreator && (request.status === 'Resolved' || request.status === 'Closed') && !request.isFeedbackSubmitted && (
                        <FeedbackForm requestId={id} onFeedbackSubmitted={() => refetchRequest()} />
                    )}

                    {/* SLA Timer */}
                    <SLATimer deadline={request.slaDeadline} status={request.status} priority={request.priority} />

                    {/* Request Details Quick Info */}
                    <div className="srp-card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={14} color="var(--srp-primary)" /> Quick Info</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px', color: 'var(--srp-text-muted)' }}>Priority</span>
                                <PriorityBadge priority={request.priority} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px', color: 'var(--srp-text-muted)' }}>Status</span>
                                <StatusBadge status={request.status} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '13px', color: 'var(--srp-text-muted)' }}>Assigned To</span>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--srp-primary-light)', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{request.assignedTo?.name?.charAt(0) || '?'}</div>
                                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{request.assignedTo?.name || 'Unassigned'}</span>
                                    </div>
                                    {request.assignedBy && (
                                        <span style={{ fontSize: '11px', color: 'var(--srp-text-muted)' }}>
                                            Assigned by {request.assignedBy}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="srp-card" style={{ padding: '24px' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><History size={15} /> Request History</h3>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {activities.map((activity, i) => (
                                <TimelineItem key={i} activity={activity} isLast={i === activities.length - 1} />
                            ))}
                        </div>
                    </div>

                    {(isAdmin || isManager) && (
                        <button onClick={handleDelete} className="srp-btn text-danger w-100" style={{ justifyContent: 'center', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                            <Trash2 size={16} /> Delete Request
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestDetails;

