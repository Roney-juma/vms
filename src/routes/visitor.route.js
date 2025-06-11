const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitor.controller');
const upload = require('../utils/upload');

router.post('/', upload.single('image'), visitorController.registerVisitor);
router.get('/', visitorController.getAllVisitors);
router.get('/current', visitorController.getCurrentVisitors);
router.get('/:id', visitorController.getVisitor);
router.put('/:id', visitorController.updateVisitor);
router.put('/:id/checkout', visitorController.checkOutVisitor);

module.exports = router;