const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const fileController = require('../controllers/fileController');

router.get('/:id', ensureAuthenticated, fileController.showFileDetails);

module.exports = router;