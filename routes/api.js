// Dependencies
const express = require('express');
const router = express.Router();
//Adding controller
const places = require('../api/places');
const users = require('../api/users');

/**** Router paths for API ****/
/*** Places ***/
// GET all places
router.get('/places', places.getAll);
// GET one place
router.get('/places/:title', places.getOne);
// Add a place
router.post('/places', places.insertOne);
// Remove a place
router.delete('/places/:title', places.removeOne);
// Update a place
router.put('/places/:title', places.updateOne);

/*** Users ***/
// GET all users
router.get('/users', users.getAll);
//Get a user
router.get('/users/:username', users.getOne);
// Create a user
router.post('/users', users.insertOne);
// Remove a user
router.delete('/users/:username', users.removeOne);
// Update user
router.put('/users/:username', users.updateOne);
// Login to a users account
router.get('/login', users.login);

// Export the routes
module.exports = router;
