const express = require('express');
const router = express.Router();
const dashboardCtrl = require('../controllers/dashboardCtrl');

router.get('/stats', dashboardCtrl.getStats);
router.get('/feed',  dashboardCtrl.getFeed);
router.get('/siem',  dashboardCtrl.getSIEM);

module.exports = router;
