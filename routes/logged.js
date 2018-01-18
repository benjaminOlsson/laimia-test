//Dependencies
const express = require('express');
const router = express.Router();

//Adding controller
const logged = require('../controllers/logged');

/** Pages after the user have logged in **/
//Frontpage
router.get('/:user', logged.frontpage);
//Exporting the router
module.exports = router;
