const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.contoller');

router.get('/', logController.getAllLogs);
router.get('/visitor/:visitorId', logController.getVisitorLogs);
router.get('/date', logController.getLogsByDate);

module.exports = router;