const express = require('express');
const multer = require('multer');
const { analyzePdf } = require('../controllers/pdfController');
const validateToken = require('../middleware/validateTokenHandler');

const router = express.Router();
const upload = multer(); // memory storage

router.post('/analyze', validateToken, upload.single('pdf'), analyzePdf);

module.exports = router;
