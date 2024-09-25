const express = require('express');
const router = express.Router();
const lans = require('../controller/l4nscontrol');

// Existing routes
router.get('/', lans.index);
router.post('/save', lans.save);

// New route for displaying the playlist
router.get('/playlist', lans.playlist);

router.get('/update/:id', lans.updateForm); // Show update form
router.post('/update/:song_id', lans.update); // Handle update form submission

// New route for deleting a song from the playlist
router.post('/delete/:song_id', lans.delete); 
router.get('/playlist', lans.playlist);





// Exporting the router
module.exports = router;
