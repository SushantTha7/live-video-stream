const express = require('express');
const pageController = require('../controllers/pageController')
const router = express.Router();

router.get('/', pageController.pageIndex);
router.get('/recognizeface', pageController.recongnizeFace);
router.get('/client', pageController.client);
router.get('/aboutus', pageController.aboutus)

module.exports = router;