const fs = require('fs');
const path = require('path');
const products = require('../models/MusicModels');

const ph = {
    index: (req, res) => {
        res.render('index');
    },

    save: (req, res) => {
        const { title, artist, lyrics } = req.body;

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const musicFile = req.files.file;
        const imageFile = req.files.picture;

        // Define upload paths
        const musicUploadPath = path.join(__dirname, '../uploads/musics/', musicFile.name);
        const imageUploadPath = path.join(__dirname, '../uploads/images/', imageFile.name);

        // Ensure the images directory exists
        const imagesDir = path.join(__dirname, '../uploads/images');
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Move music file
        musicFile.mv(musicUploadPath, (err) => {
            if (err) {
                return res.status(500).send(err);
            }

            // Move image file
            imageFile.mv(imageUploadPath, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }

                const data = {
                    title: title,
                    artist: artist,
                    file_path: musicFile.name,
                    image_path: imageFile.name, // Ensure you have this field in your database
                    lyrics: lyrics
                };

                products.create(data, (err) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    res.redirect('/');
                });
            });
        });
    },

    // Method to show playlist
    playlist: (req, res) => {
        products.getAll((err, result) => {
            if (err) {
                throw err;
            }
            res.render('playlist', { songs: result });
        });
    },

    // Method to show the update form with current song details
    // Method to show the update form with current song details
    updateForm: (req, res) => {
        const songId = req.params.id;
        products.findById(songId, (err, song) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error retrieving song details');
            } else {
                res.render('update', { song }); // Render update form with song details
            }
        });
    },

    // Method to handle updating a song
    update: (req, res) => {
        console.log(req.files); // Check the req.files object
        const songId = req.params.song_id; // Access the song_id parameter
        const { title, artist, lyrics } = req.body;
        let updatedData = { title, artist, lyrics };
    
        // Get the existing song data from the database
        products.findById(songId, (err, song) => {
            if (err) {
                return res.status(500).send(err);
            }
    
            // Keep the existing file_path and image_path if no new files are uploaded
            updatedData.file_path = song.file_path;
            updatedData.image_path = song.image_path;
    
            // Create an array to hold promises for file uploads
            const uploadPromises = [];
    
            // If a new music file is uploaded, update the file_path
            if (req.files && req.files.file) {
                const musicFile = req.files.file;
                const musicUploadPath = path.join(__dirname, '../uploads/musics/', musicFile.name);
    
                // Move music file and return a promise
                const musicUploadPromise = new Promise((resolve, reject) => {
                    musicFile.mv(musicUploadPath, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        updatedData.file_path = musicFile.name;
                        resolve();
                    });
                });
                uploadPromises.push(musicUploadPromise);
            }
    
            // If a new image file is uploaded, update the image_path
            if (req.files && req.files.picture) {
                const imageFile = req.files.picture;
                const imageUploadPath = path.join(__dirname, '../uploads/images/', imageFile.name);
    
                // Move image file and return a promise
                const imageUploadPromise = new Promise((resolve, reject) => {
                    imageFile.mv(imageUploadPath, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        updatedData.image_path = imageFile.name;
                        resolve();
                    });
                });
                uploadPromises.push(imageUploadPromise);
            }
    
            // Wait for all uploads to complete before updating the database
            Promise.all(uploadPromises)
                .then(() => {
                    console.log(updatedData); // Check the updatedData object
                    products.updateById(songId, updatedData, (err) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        res.redirect('/playlist');
                    });
                })
                .catch(err => {
                    return res.status(500).send(err);
                });
        });
    },
    // Method to delete a song
    delete: (req, res) => {
        const song_id = req.params.song_id; // Assuming song_id is passed as a URL parameter

        products.deleteById(song_id, (err, result) => {
            if (err) {
                console.error("Error deleting the song:", err); // Detailed error logging
                return res.status(500).send('Failed to delete the song.');
            }

            if (result.affectedRows === 0) {
                // This means no song was found with the provided song_id
                return res.status(404).send('Song not found.');
            }

            console.log(`Song with song_id ${song_id} deleted successfully.`);
            res.redirect('/playlist'); // Redirect back to the playlist after deletion
        });
    },
    playlist: (req, res) => {
    const searchTerm = req.query.search; // Get the search term from the query parameters
    products.getAll((err, result) => {
        if (err) {
            throw err;
        }

        // Filter results based on the search term
        const filteredSongs = searchTerm ? result.filter(song => 
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            song.artist.toLowerCase().includes(searchTerm.toLowerCase())
        ) : result;

        res.render('playlist', { songs: filteredSongs });
    });
},


};

module.exports = ph;
