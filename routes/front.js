//Dependencies
const express = require('express');
const router = express.Router();
//Adding controller
const front = require('../controllers/front');

//pages
router.get('/', front.frontpage);

module.exports = router;
