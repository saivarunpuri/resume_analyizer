const express = require('express');
const multer = require('multer');
const { uploadResume, getAllResumes, getResumeById } = require('../controllers/resumeController');
const router = express.Router();
const upload = multer();

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getAllResumes);
router.get('/:id', getResumeById);

module.exports = router;