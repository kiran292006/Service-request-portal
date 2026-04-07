const express = require('express');
const {
    createRequest,
    getMyRequests,
    getRequest,
    submitFeedback
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getMyRequests)
    .post(upload.single('image'), createRequest);

router.route('/:id')
    .get(getRequest);

router.route('/:id/feedback')
    .put(submitFeedback);

module.exports = router;
