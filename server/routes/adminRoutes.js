const express = require('express');
const {
    getAllRequests,
    updateRequest,
    getAnalytics,
    getUsers,
    deleteRequest,
    createUser,
    updateUser,
    deleteUser,
    getTechnicianTickets,
    getActivity
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Technician/Manager/Admin/User accessible update (Status/Remarks)
router.put('/requests/:id', protect, authorize('admin', 'manager', 'technician', 'user'), updateRequest);

// Technician routes
router.get('/technician/tickets', protect, authorize('technician', 'admin'), getTechnicianTickets);

// Ticket Activity route
router.get('/requests/:id/activity', protect, getActivity);

// Admin-only management routes
// Admin/Manager shared routes
router.get('/requests', protect, authorize('admin', 'manager'), getAllRequests);
router.get('/users', protect, authorize('admin', 'manager'), getUsers);
router.post('/users', protect, authorize('admin', 'manager'), createUser);
router.put('/users/:id', protect, authorize('admin', 'manager'), updateUser);
router.delete('/users/:id', protect, authorize('admin', 'manager'), deleteUser);
router.delete('/requests/:id', protect, authorize('admin', 'manager'), deleteRequest);
router.get('/analytics', protect, authorize('admin', 'manager'), getAnalytics);

// Admin-only management routes
router.use(protect);
router.use(authorize('admin'));

module.exports = router;
