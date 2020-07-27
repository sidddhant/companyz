
const express = require('express');

const companyZController = require('../controllers/companyZ');

const router = express.Router();

router.get('/jobs/:jobName', companyZController.getJobs);
router.post('/login', companyZController.loginUser);
router.post('/jobs', companyZController.authUserAndOrderPart);
router.post('/search', companyZController.insertSearch);

module.exports = router;
