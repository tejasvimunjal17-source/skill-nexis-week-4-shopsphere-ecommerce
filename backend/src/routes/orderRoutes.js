const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', c.create);
router.get('/mine', c.mine); // must be before "/:id"
router.get('/:id', c.getOne);

module.exports = router;
