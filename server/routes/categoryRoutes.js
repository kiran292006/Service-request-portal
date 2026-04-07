const express = require('express');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
    .route('/')
    .get(getCategories)
    .post(authorize('admin', 'manager'), createCategory);

router
    .route('/:id')
    .get(getCategory)
    .put(authorize('admin', 'manager'), updateCategory)
    .delete(authorize('admin', 'manager'), deleteCategory);

module.exports = router;
