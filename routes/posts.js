// routes/posts.js
const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware');
const { permit } = require('../middleware/roleMiddleware');
const postsController = require('../controllers/postsController');

// Public
router.get('/', postsController.getPublishedPosts);
router.get('/slug/:slug', postsController.getPostBySlug);

// Protected
router.post('/', authenticate, permit('admin', 'author'), postsController.createPost);
router.put('/:id', authenticate, permit('admin', 'author'), postsController.updatePost);
router.delete('/:id', authenticate, permit('admin', 'author'), postsController.deletePost);

module.exports = router;
