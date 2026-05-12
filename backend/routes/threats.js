const express = require('express');
const router = express.Router();
const threatCtrl = require('../controllers/threatCtrl');
const authMiddleware = require('../middleware/auth');

router.get('/',              threatCtrl.getThreats);
router.get('/:id',           threatCtrl.getThreat);
router.post('/',             authMiddleware, threatCtrl.createThreat);
router.patch('/:id/status',  authMiddleware, threatCtrl.updateStatus);

module.exports = router;
