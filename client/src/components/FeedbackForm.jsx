import React, { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const FeedbackForm = ({ requestId, onFeedbackSubmitted }) => {
    const [rating] = useState(5); // Default to 5 internally
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/requests/${requestId}/feedback`, { rating, feedback });
            setSubmitted(true);
            if (onFeedbackSubmitted) onFeedbackSubmitted();
        } catch (err) {
            console.error(err);
            alert('Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="srp-card text-center" style={{ padding: '32px', backgroundColor: '#10B98105', border: '1px solid #10B98120' }}>
                <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: '#10B98115', borderRadius: '50%', color: '#10B981', marginBottom: '16px' }}>
                    <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px' }}>Thank you for your feedback!</h3>
                <p style={{ color: 'var(--srp-text-muted)', fontSize: '14px', margin: 0 }}>Your input helps us improve our service standards.</p>
            </div>
        );
    }

    return (
        <div className="srp-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>Satisfaction Report</h3>
            <p style={{ fontSize: '13px', color: 'var(--srp-text-muted)', margin: '0 0 20px' }}>Share your thoughts on the support received for this request.</p>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--srp-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Your Comments
                    </label>
                    <textarea
                        className="srp-input"
                        placeholder="What did we do well? What can we improve?"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        style={{ minHeight: '120px', resize: 'vertical' }}
                    />
                </div>

                <button
                    type="submit"
                    className="srp-btn srp-btn-primary w-100"
                    disabled={loading}
                    style={{ borderRadius: '12px', padding: '12px' }}
                >
                    {loading ? (
                        <div className="spinner-border spinner-border-sm me-2" />
                    ) : (
                        <Send size={16} className="me-2" />
                    )}
                    Submit Feedback
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;
