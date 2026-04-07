import React, { useState } from 'react';
import { Star, Search } from 'lucide-react';

const TeamPerformanceTable = ({ technicians, analytics }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTechs = (technicians || []).filter(tech => 
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Search Filter */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--srp-border)', backgroundColor: 'var(--srp-bg-alt)' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--srp-text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Search technicians..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '8px 12px 8px 36px', borderRadius: '10px',
                            border: '1px solid var(--srp-border)', backgroundColor: 'var(--srp-card-bg)',
                            fontSize: '13px', color: 'var(--srp-text)', transition: 'all 0.2s'
                        }}
                    />
                </div>
            </div>

            <div className="table-responsive" style={{ flexGrow: 1 }}>
                <table className="srp-table" style={{ marginBottom: 0 }}>
                    <thead>
                        <tr>
                            <th>Technician</th>
                            <th>Category</th>
                            <th>Active</th>
                            <th>Resolved</th>
                            <th>Avg. Time</th>
                            <th>Points</th>
                            <th style={{ textAlign: 'right' }}>Load</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTechs.length > 0 ? (
                            filteredTechs.map(tech => {
                                const activePerf = (analytics?.activeTicketsPerTech || []).find(a => {
                                    const aId = a._id?._id || a._id;
                                    return aId?.toString() === tech._id?.toString();
                                });
                                const active = activePerf?.count || 0;
                                
                                const techPerf = (analytics?.techPerformance || []).find(p => {
                                    const pId = p._id?._id || p._id;
                                    return pId?.toString() === tech._id?.toString();
                                });
                                
                                const resolved = techPerf?.count || 0;
                                const avgTime = techPerf?.avgResolutionTime || 0;
                                const points = 0; // Points reset/hidden as per request
                                const category = Array.isArray(tech.specialties) && tech.specialties.length > 0 
                                    ? tech.specialties[0] 
                                    : 'General';

                                let loadVar = 'success';
                                let loadLabel = 'Low';
                                if (active > 5) { loadVar = 'warning'; loadLabel = 'Med'; }
                                if (active > 10) { loadVar = 'danger'; loadLabel = 'High'; }

                                return (
                                    <tr key={tech._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '10px',
                                                    backgroundColor: 'var(--srp-primary-light)', color: 'var(--srp-primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800
                                                }}>
                                                    {tech.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--srp-text)' }}>{tech.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--srp-text-muted)' }}>{tech.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ 
                                                fontSize: '11px', fontWeight: 700, color: 'var(--srp-text-muted)',
                                                textTransform: 'uppercase', letterSpacing: '0.02em',
                                                backgroundColor: 'var(--srp-bg-alt)', padding: '4px 8px', borderRadius: '6px'
                                            }}>
                                                {category}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 800, color: 'var(--srp-text)' }}>{active}</td>
                                        <td style={{ fontWeight: 600 }}>{resolved}</td>
                                        <td style={{ fontSize: '13px' }}>{avgTime ? `${Math.round(avgTime)}m` : '-'}</td>
                                        <td style={{ fontWeight: 800, color: 'var(--srp-primary)' }}>{points}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 800,
                                                backgroundColor: `var(--srp-${loadVar}-bg)`, color: `var(--srp-${loadVar})`, textTransform: 'uppercase'
                                            }}>
                                                {loadLabel}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--srp-text-muted)' }}>
                                    No technicians found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamPerformanceTable;
