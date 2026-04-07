const express = require('express');
const {
    getNotifications,
    markRead,
    markAllRead,
    deleteAllNotifications,
    deleteNotification
} = require('../controllers/notificationController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.delete('/clear/all', deleteAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
