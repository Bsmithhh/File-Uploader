const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const { ensureAuthenticated } = require('../middleware/auth');


router.get('/', ensureAuthenticated, folderController.showAllFolders);
router.get('/new', ensureAuthenticated, folderController.showNewForm);
router.post('/new', ensureAuthenticated, folderController.createFolder);
router.get('/:id', ensureAuthenticated, folderController.showFolderContents);

module.exports = router;