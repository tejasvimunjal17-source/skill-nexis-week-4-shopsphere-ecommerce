const router = require('express').Router();
const c = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/authorize');

router.get('/', c.list);
router.get('/categories', c.categories); // must be before "/:id"
router.get('/:id', c.getOne);

router.post('/', protect, requireAdmin, c.create);
router.put('/:id', protect, requireAdmin, c.update);
router.delete('/:id', protect, requireAdmin, c.remove);

module.exports = router;
