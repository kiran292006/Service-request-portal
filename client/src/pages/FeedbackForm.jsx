import React, { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ModalAnimation, AnimatedButton } from '../components/AnimationWrapper';
import api from '../services/api';

const FeedbackForm = ({ requestId, onFeedbackSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

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
            <ModalAnimation>
                <div className="srp-card text-center" style={{ padding: '32px', backgroundColor: '#10B98105', border: '1px solid #10B98120' }}>
                    <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: '#10B98115', borderRadius: '50%', color: '#10B981', marginBottom: '16px' }}>
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px' }}>Thank you for your feedback!</h3>
                    <p style={{ color: 'var(--srp-text-muted)', fontSize: '14px', margin: 0 }}>Your input helps us improve our service standards.</p>
                </div>
            </ModalAnimation>
        );
    }

    return (
        <ModalAnimation>
            <div className="srp-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>How was your experience?</h3>
            <p style={{ fontSize: '13px', color: 'var(--srp-text-muted)', margin: '0 0 20px' }}>Please take a moment to rate our support for this request.</p>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        >
                            <Star
                                size={28}
                                fill={(hover || rating) >= star ? '#F59E0B' : 'transparent'}
                                color={(hover || rating) >= star ? '#F59E0B' : 'var(--srp-border)'}
                                style={{ transition: 'all 0.2s' }}
                            />
                        </motion.button>
                    ))}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--srp-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Additional Comments (Optional)
                    </label>
                    <textarea
                        className="srp-input"
                        placeholder="What did we do well? What can we improve?"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        style={{ minHeight: '100px', resize: 'vertical' }}
                    />
                </div>

                <AnimatedButton
                    type="submit"
                    className="srp-btn srp-btn-primary w-100"
                    disabled={rating === 0 || loading}
                    style={{ borderRadius: '12px', padding: '12px' }}
                >
                    {loading ? (
                        <div className="spinner-border spinner-border-sm me-2" />
                    ) : (
                        <Send size={16} className="me-2" />
                    )}
                    Submit Satisfaction Report
                </AnimatedButton>
            </form>
        </div>
        </ModalAnimation>
    );
};

export default FeedbackForm;
