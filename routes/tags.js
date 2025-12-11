const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { permit } = require('../middleware/roleMiddleware');
const controller = require('../controllers/tagsController');

router.get('/', controller.getAll);
router.post('/', authenticate, permit('admin'), controller.create);
router.put('/:id', authenticate, permit('admin'), controller.update);
router.delete('/:id', authenticate, permit('admin'), controller.delete);

module.exports = router;
