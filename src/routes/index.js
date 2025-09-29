const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/uploads');
const uploadController = require('../controllers/uploadController');
const homeController = require('../controllers/homeController');


router.get('/', ensureAuthenticated, homeController.showHomePage);

router.get('/upload', ensureAuthenticated, uploadController.showUploadForm);
  
router.post('/upload', ensureAuthenticated, upload.single('file'), uploadController.processUpload);

module.exports = router;