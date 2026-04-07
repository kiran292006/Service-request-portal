import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Sparkles,
    Send,
    X,
    Bot,
    ShieldCheck,
    HelpCircle,
    ChevronRight,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your SRP Assistant. How can I help you navigate the portal today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            const aiMsg = {
                id: Date.now() + 1,
                text: getAIResponse(input),
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const getAIResponse = (query) => {
        const q = query.toLowerCase();
        if (q.includes('request')) return "You can view your active requests in the 'My Requests' section or create a new one using the 'Submit Request' button.";
        if (q.includes('admin')) return "Admin functions are located in the sidebar under 'All Requests' and 'Manage Users'.";
        if (q.includes('profile')) return "You can update your personal data and security keys in the 'Profile Settings' page.";
        if (q.includes('help') || q.includes('support')) return "Our technical team is available 24/7. You can also use Ctrl+K to find specific actions instantly.";
        return "I'm still learning, but I can help you find requests, manage users, or update your profile. Try asking 'How do I see my requests?'.";
    };

    return (
        <div className="position-fixed bottom-0 end-0 p-4 p-md-5 z-3 d-flex flex-column align-items-end" style={{ zIndex: 1060 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="srp-card srp-glass shadow-2xl border-0 mb-4 overflow-hidden d-flex flex-column"
                        style={{ width: '380px', height: '600px', maxWidth: '90vw' }}
                    >
                        {/* Header */}
                        <div className="p-4 bg-dark text-white position-relative overflow-hidden">
                            <div className="position-absolute top-0 end-0 p-4 opacity-10 pointer-events-none" style={{ transform: 'scale(1.5) translate(20%, -20%)' }}>
                                <Sparkles size={80} />
                            </div>
                            <div className="position-relative z-index-1 d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-primary rounded-4 d-flex align-items-center justify-content-center shadow-lg" style={{ width: '48px', height: '48px' }}>
                                        <Bot size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h6 className="fw-black text-white tracking-tight m-0">SRP Assistant</h6>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <div className="bg-success rounded-circle animate-pulse" style={{ width: '6px', height: '6px' }}></div>
                                            <span className="text-uppercase fw-black text-muted small tracking-widest" style={{ fontSize: '9px' }}>Neural node active</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="btn btn-link text-muted p-2 shadow-none border-0 hover:bg-white hover:bg-opacity-10 rounded-3">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-grow-1 overflow-y-auto p-4 d-flex flex-column gap-4"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {messages.map((m) => (
                                <div key={m.id} className={`d-flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`rounded-4 d-flex align-items-center justify-content-center fw-black text-white shrink-0 mt-1`} style={{ width: '32px', height: '32px', fontSize: '10px', background: m.sender === 'ai' ? 'var(--srp-primary)' : '#1e1e2d' }}>
                                        {m.sender === 'ai' ? 'AI' : 'U'}
                                    </div>
                                    <div className={`
                                        p-3 px-4 rounded-5 small fw-bold lh-lg shadow-sm
                                        ${m.sender === 'ai'
                                            ? 'bg-white text-dark border border-light'
                                            : 'bg-primary text-white border border-primary border-opacity-10'}
                                    `} style={{ borderRadius: m.sender === 'ai' ? '1.25rem 1.25rem 1.25rem 0.25rem' : '1.25rem 1.25rem 0.25rem 1.25rem' }}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="d-flex gap-3">
                                    <div className="bg-primary rounded-4 d-flex align-items-center justify-content-center fw-black text-white shadow-sm shrink-0 mt-1" style={{ width: '32px', height: '32px', fontSize: '10px' }}>AI</div>
                                    <div className="bg-white p-3 px-4 rounded-5 border border-light d-flex gap-1 align-items-center py-3">
                                        <div className="bg-muted opacity-25 rounded-circle animate-bounce" style={{ width: '6px', height: '6px' }}></div>
                                        <div className="bg-muted opacity-25 rounded-circle animate-bounce" style={{ width: '6px', height: '6px', animationDelay: '0.2s' }}></div>
                                        <div className="bg-muted opacity-25 rounded-circle animate-bounce" style={{ width: '6px', height: '6px', animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-white bg-opacity-50 border-top border-light">
                            <div className="position-relative">
                                <input
                                    type="text"
                                    placeholder="Type your query..."
                                    className="form-control srp-input ps-4 pe-5 py-3 small fw-bold border-0 shadow-sm"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    style={{ fontSize: '14px' }}
                                />
                                <button
                                    type="submit"
                                    className="position-absolute top-50 end-0 translate-middle-y me-2 srp-btn srp-btn-primary p-0 d-flex align-items-center justify-content-center shadow-lg active:scale-95"
                                    style={{ width: '36px', height: '36px' }}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    srp-btn p-0 d-flex align-items-center justify-content-center shadow-lg transition-all duration-500 active:scale-90 overflow-hidden position-relative
                    ${isOpen ? 'bg-dark border-0 rotate-90' : 'srp-btn-primary'}
                `}
                style={{ width: '70px', height: '70px', borderRadius: '1.75rem' }}
            >
                {isOpen ? (
                    <X size={28} className="text-white" />
                ) : (
                    <>
                        <div className="position-absolute top-0 start-0 m-2 mt-n1 ms-n1">
                            <div className="bg-danger border border-2 border-white rounded-circle animate-pulse" style={{ width: '12px', height: '12px' }}></div>
                        </div>
                        <Sparkles size={28} className="text-white animate-srp-float" />
                    </>
                )}
            </button>
        </div>
    );
};

export default AIWidget;
