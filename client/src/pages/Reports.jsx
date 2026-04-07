import React from 'react';
import useRequests from '../hooks/useRequests';
import { useTheme } from '../context/ThemeContext';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import {
    FileBarChart,
    PieChart,
    Activity,
    TrendingUp,
    ExternalLink,
    Sparkles,
    Download,
    Cpu,
    CheckCircle2,
    ArrowRight,
    AlertCircle
} from 'lucide-react';
import DashboardCards from '../components/DashboardCards';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement,
    Filler
);

const Reports = () => {
    const { useAnalytics } = useRequests();
    const { data, isLoading } = useAnalytics();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (isLoading) {
        return (
            <div className="d-flex align-items-center justify-content-center h-100 py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const analytics = data?.data;

    // Dark mode text/border variables for Chart.js
    const chartTextColor = isDark ? '#94A3B8' : '#6B7280';
    const cardBgColor = isDark ? '#1E293B' : '#ffffff';

    const statusColors = {
        'Open': '#fcd34d',          // Yellow
        'Assigned': '#c084fc',      // Purple
        'In Progress': '#3b82f6',   // Blue
        'Waiting for User': '#fb923c', // Orange
        'Resolved': '#10b981',      // Green
        'Rejected': '#f43f5e',      // Red
        'Closed': '#94a3b8',        // Gray
        'Pending': '#fcd34d'        // Legacy Yellow
    };

    const statusChartData = {
        labels: analytics?.statsByStatus?.map(s => s._id || 'Unknown') || [],
        datasets: [{
            data: analytics?.statsByStatus?.map(s => s.count || 0) || [],
            backgroundColor: analytics?.statsByStatus?.map(s => statusColors[s._id] || '#cbd5e1') || [],
            borderWidth: 6,
            borderColor: cardBgColor,
            hoverOffset: 20
        }]
    };

    const priorityOrder = ['Low', 'Medium', 'High', 'Critical'];
    const priorityColors = {
        'Low': '#10b981',       // Emerald
        'Medium': '#3b82f6',    // Blue
        'High': '#f59e0b',      // Amber
        'Critical': '#ef4444'   // Red
    };

    const sortedPriorityStats = priorityOrder.map(level => {
        const found = analytics?.statsByPriority?.find(p => p._id === level);
        return { _id: level, count: found ? found.count : 0 };
    });

    const priorityChartData = {
        labels: sortedPriorityStats.map(p => p._id),
        datasets: [{
            label: 'Request Volume',
            data: sortedPriorityStats.map(p => p.count),
            backgroundColor: sortedPriorityStats.map(p => priorityColors[p._id]),
            borderColor: sortedPriorityStats.map(p => priorityColors[p._id]),
            borderWidth: 0,
            borderRadius: 8,
            barThickness: 40,
        }]
    };

    const handleExport = () => {
        if (!analytics) return;
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Category,Type,Count\n";

        if (analytics.statsByStatus) {
            analytics.statsByStatus.forEach(s => {
                csvContent += `Status,${s._id || 'Unknown'},${s.count}\n`;
            });
        }

        if (analytics.statsByPriority) {
            analytics.statsByPriority.forEach(p => {
                csvContent += `Priority,${p._id || 'Unknown'},${p.count}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "srp_analytics_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container-xxl py-4 animate-srp-fade">
            {/* Header */}
            <div className="row align-items-end justify-content-between g-4 mb-5">
                <div className="col-md-auto animate-srp-slide stagger-1">
                    <div className="d-flex align-items-center gap-2 mb-2 text-uppercase fw-black text-primary small tracking-widest">
                        <Cpu size={14} />
                        Data Intelligence
                    </div>
                    <h1 className="display-5 fw-black tracking-tight mb-2" style={{ color: 'var(--srp-text)' }}>System Analytics</h1>
                    <p className="fw-bold small m-0" style={{ color: 'var(--srp-text-muted)' }}>Quantifying helpdesk performance and throughput.</p>
                </div>

                <div className="col-md-auto animate-srp-slide stagger-2">
                    <button onClick={handleExport} className="srp-btn srp-card shadow-sm border-0 group d-flex align-items-center gap-2" style={{ padding: '10px 20px', backgroundColor: cardBgColor }}>
                        <Download size={18} className="transition-transform group-hover:translate-y-1" style={{ color: 'var(--srp-text)' }} />
                        <span style={{ color: 'var(--srp-text)' }}>Export Raw Data</span>
                    </button>
                </div>
            </div>

            {/* Key Metrics Section */}
            <div className="mb-5 animate-srp-slide stagger-3">
                <DashboardCards stats={analytics} />
                {analytics?.slaBreaches > 0 && (
                    <div className="mt-4 srp-card p-3 border-danger bg-danger-subtle animate-pulse" style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-danger text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h4 className="h6 m-0 fw-black text-danger">Critical: SLA Breaches Detected</h4>
                                <p className="m-0 small text-danger-emphasis fw-bold">{analytics.slaBreaches} tickets have exceeded their resolution deadline and require immediate attention.</p>
                            </div>
                            <button className="btn btn-danger btn-sm ms-auto fw-bold px-3 rounded-3" style={{ fontSize: '12px' }}>
                                View Breached Requests
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Charts Grid */}
            <div className="row g-4 mb-5 animate-srp-slide stagger-4">
                <div className="col-lg-6">
                    <div className="srp-card p-4 p-md-5 border-0 shadow-lg h-100 group">
                        <div className="d-flex align-items-center justify-content-between mb-5">
                            <div>
                                <h3 className="fw-black tracking-tight m-0" style={{ color: 'var(--srp-text)' }}>Status Metrics</h3>
                                <p className="fw-black text-uppercase small tracking-widest m-0 mt-1" style={{ color: 'var(--srp-text-muted)', fontSize: '10px' }}>Global Distribution</p>
                            </div>
                            <div className="bg-light rounded-4 p-3 transition-transform group-hover:rotate-12">
                                <PieChart size={24} className="text-primary" />
                            </div>
                        </div>
                        <div className="position-relative" style={{ height: '350px' }}>
                            <Pie
                                data={statusChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    cutout: '75%',
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                usePointStyle: true,
                                                padding: 30,
                                                font: { size: 11, weight: 'bold', family: 'Inter' },
                                                color: chartTextColor
                                            }
                                        }
                                    }
                                }}
                            />
                            <div className="position-absolute top-50 start-50 translate-middle text-center pointer-events-none">
                                <span className="display-4 fw-black d-block lh-1 text-center" style={{ color: 'var(--srp-text)' }}>{analytics?.total || 0}</span>
                                <span className="fw-black text-uppercase small tracking-widest" style={{ color: 'var(--srp-text-muted)' }}>Requests</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="srp-card p-4 p-md-5 border-0 shadow-lg h-100 group">
                        <div className="d-flex align-items-center justify-content-between mb-5">
                            <div>
                                <h3 className="fw-black tracking-tight m-0" style={{ color: 'var(--srp-text)' }}>Priority Load</h3>
                                <p className="fw-black text-uppercase small tracking-widest m-0 mt-1" style={{ color: 'var(--srp-text-muted)', fontSize: '10px' }}>System Urgency Heatmap</p>
                            </div>
                            <div className="bg-light rounded-4 p-3 transition-transform group-hover:rotate-12">
                                <TrendingUp size={24} className="text-primary" />
                            </div>
                        </div>
                        <div style={{ height: '350px' }}>
                            <Bar
                                data={priorityChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: { display: false },
                                            ticks: {
                                                stepSize: 1, // Force whole numbers (1, 2, 3...)
                                                font: { weight: 'bold', family: 'Inter' },
                                                color: chartTextColor
                                            }
                                        },
                                        x: {
                                            grid: { display: false },
                                            ticks: {
                                                font: { weight: 'bold', family: 'Inter' },
                                                color: chartTextColor
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
