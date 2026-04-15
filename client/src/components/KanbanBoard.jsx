import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useRequests from '../hooks/useRequests';
import { StatusBadge, PriorityBadge } from './RequestTable';
import { API_BASE_URL } from '../services/api';
import {
    MoreVertical,
    MessageSquare,
    Calendar,
    ArrowRight,
    Search,
    Filter,
    Sparkles,
    FileText,
    Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KanbanBoard = ({ requests = [], isLoading }) => {
    const navigate = useNavigate();
    const { useUpdateStatus } = useRequests();
    const updateStatusMutation = useUpdateStatus();

    const [columns, setColumns] = useState({
        'Open': [],
        'Assigned': [],
        'In Progress': [],
        'Resolved': []
    });

    useEffect(() => {
        if (Array.isArray(requests)) {
            setColumns({
                'Open': requests.filter(r => r.status === 'Open'),
                'Assigned': requests.filter(r => r.status === 'Assigned'),
                'In Progress': requests.filter(r => r.status === 'In Progress'),
                'Resolved': requests.filter(r => r.status === 'Resolved')
            });
        }
    }, [requests]);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const sourceCol = columns[source.droppableId];
        const destCol = columns[destination.droppableId];
        const item = sourceCol.find(r => r._id === draggableId);

        if (source.droppableId !== destination.droppableId) {
            // Update Backend
            try {
                await updateStatusMutation.mutateAsync({
                    id: draggableId,
                    statusData: { status: destination.droppableId }
                });
            } catch (err) {
                console.error("Failed to update status", err);
                return;
            }

            // Update UI optimistically
            const newSource = [...sourceCol];
            newSource.splice(source.index, 1);
            const newDest = [...destCol];
            newDest.splice(destination.index, 0, { ...item, status: destination.droppableId });

            setColumns({
                ...columns,
                [source.droppableId]: newSource,
                [destination.droppableId]: newDest
            });
        }
    };

    if (isLoading) return <div className="p-5 text-center fw-black text-muted opacity-25 animate-pulse fs-4">SYNCHRONIZING KANBAN...</div>;

    return (
        <div className="animate-srp-fade">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-5 px-2">
                <div>
                    <h2 className="fw-black text-dark tracking-tight m-0">Lifecycle Manager</h2>
                    <p className="text-muted fw-bold small text-uppercase tracking-widest m-0 mt-1" style={{ fontSize: '10px' }}>Drag and drop requests to manifest status changes</p>
                </div>
                <div className="d-flex gap-3">
                    <div className="position-relative">
                        <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted opacity-50" />
                        <input type="text" placeholder="Trace request..." className="form-control srp-input ps-5 py-2 small shadow-sm border-0" style={{ width: '220px' }} />
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="row g-4 pb-4">
                    {Object.keys(columns).map((colId) => (
                        <div key={colId} className="col-lg-4 d-flex flex-column" style={{ minHeight: '600px' }}>
                            <div className="d-flex align-items-center justify-content-between px-3 mb-4">
                                <div className="d-flex align-items-center gap-2">
                                    <div className={`rounded-circle shadow-sm ${colId === 'Open' ? 'bg-warning' :
                                            colId === 'Assigned' ? 'bg-info' :
                                                colId === 'In Progress' ? 'bg-primary' :
                                                    'bg-success'
                                        }`} style={{ width: '10px', height: '10px' }} />
                                    <h6 className="fw-black text-dark text-uppercase small tracking-widest m-0">{colId}</h6>
                                    <span className="badge bg-light text-muted rounded-pill fw-bold border px-2 py-1" style={{ fontSize: '9px' }}>{columns[colId].length}</span>
                                </div>
                                <MoreVertical size={16} className="text-muted opacity-25" />
                            </div>

                            <Droppable droppableId={colId}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-grow-1 p-3 rounded-5 transition-all bg-light bg-opacity-25 border-4 border-transparent ${snapshot.isDraggingOver ? 'bg-white bg-opacity-50 border-primary border-opacity-10' : ''}`}
                                        style={{ minHeight: '100px' }}
                                    >
                                        <div className="d-flex flex-column gap-3">
                                            {columns[colId].map((req, index) => (
                                                <Draggable key={req._id} draggableId={req._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => navigate(`/request/${req._id}`)}
                                                            className={`srp-card p-4 border-0 shadow-sm group transition-all cursor-pointer ${snapshot.isDragging ? 'shadow-2xl' : 'hover:shadow-md'}`}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                transform: snapshot.isDragging ? (provided.draggableProps.style.transform + ' rotate(2deg) scale(1.05)') : provided.draggableProps.style?.transform
                                                            }}
                                                        >
                                                            {req.image && !req.image.toLowerCase().endsWith('.pdf') && (
                                                                <div style={{
                                                                    height: '100px', width: 'calc(100% + 48px)',
                                                                    margin: '-24px -24px 16px -24px',
                                                                    backgroundColor: 'var(--srp-bg)',
                                                                    borderBottom: '1px solid var(--srp-border)',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <img
                                                                        src={`${API_BASE_URL}/uploads/requests/${req.image.split(/[\\/]/).pop()}`}
                                                                        alt=""
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="d-flex items-center justify-between mb-3">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <span className="badge bg-primary-subtle text-primary border-primary border-opacity-10 fw-black rounded-pill px-3 py-2" style={{ fontSize: '9px' }}>{req.ticketNumber}</span>
                                                                    {req.image?.toLowerCase().endsWith('.pdf') && (
                                                                        <div title="PDF Attached" style={{ color: '#EF4444' }}><FileText size={14} /></div>
                                                                    )}
                                                                    {req.image && !req.image.toLowerCase().endsWith('.pdf') && (
                                                                        <div title="Image Attached" style={{ color: 'var(--srp-primary)' }}><ImageIcon size={14} /></div>
                                                                    )}
                                                                </div>
                                                                <PriorityBadge priority={req.priority} />
                                                            </div>
                                                            <h6 className="fw-black text-dark line-clamp-2 lh-base mb-4">{req.title}</h6>
                                                            <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <div className="d-flex align-items-center gap-1 text-muted">
                                                                        <MessageSquare size={12} />
                                                                        <span className="fw-black" style={{ fontSize: '9px' }}>4</span>
                                                                    </div>
                                                                    <div className="d-flex align-items-center gap-1 text-muted">
                                                                        <Calendar size={12} />
                                                                        <span className="fw-black" style={{ fontSize: '9px' }}>{new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-light rounded-3 p-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                    <ArrowRight size={14} className="text-muted" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default KanbanBoard;
