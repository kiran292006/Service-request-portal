import React from 'react';
import { motion } from 'framer-motion';

/**
 * PageTransition wrapper for consistent fade-in/slide-up effects.
 */
export const PageTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ 
            duration: 0.4, 
            ease: [0.22, 1, 0.36, 1] // Custom ease-out cubic
        }}
        style={{ width: '100%', height: '100%' }}
    >
        {children}
    </motion.div>
);

/**
 * AnimatedCard for hover scaling and staggered entry.
 */
export const AnimatedCard = ({ children, delay = 0, className = '', style = {} }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ 
            duration: 0.3,
            delay: delay,
            ease: "easeOut"
        }}
        className={className}
        style={style}
    >
        {children}
    </motion.div>
);

/**
 * AnimatedButton for scale-on-hover and shrink-on-click.
 */
export const AnimatedButton = ({ children, onClick, className = '', style = {}, type = "button", disabled = false }) => (
    <motion.button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
        style={style}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
        {children}
    </motion.button>
);

/**
 * ModalAnimation for smooth overlays.
 */
export const ModalAnimation = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);
