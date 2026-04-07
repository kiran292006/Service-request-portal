const express = require('express');
const {
    getManagerAnalytics,
    getManagerRequests,
    reassignTicket
} = require('../controllers/managerController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('manager', 'admin'));

router.get('/analytics', getManagerAnalytics);
router.get('/requests', getManagerRequests);
router.put('/requests/:id/reassign', reassignTicket);

module.exports = router;
