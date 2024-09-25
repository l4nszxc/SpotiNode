const db = require('../config/db');

const prod = {
    create: (data, callback) => {
        const query = "INSERT INTO songs (title, artist, file_path, image_path, lyrics) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [data.title, data.artist, data.file_path, data.image_path, data.lyrics], callback);
    },
    
    getAll: (callback) => {
        const query = "SELECT * FROM songs";
        db.query(query, callback);
    },

    findById: (song_id, callback) => {
        const query = "SELECT * FROM songs WHERE song_id = ?";
        db.query(query, [song_id], (err, result) => {
            if (err) return callback(err);
            callback(null, result.length ? result[0] : null);
        });
    },

    deleteById: (song_id, callback) => {
        const query = "DELETE FROM songs WHERE song_id = ?";
        db.query(query, [song_id], (err, result) => {
            if (err) {
                console.error("Error in SQL query:", err); // Log SQL query errors
                return callback(err);
            }
            console.log("Deletion result:", result); // Log deletion result to see affectedRows
            callback(null, result);
        });
    },
    updateById: (songId, data, callback) => {
        const query = "UPDATE songs SET title = ?, artist = ?, file_path = ?, image_path = ?, lyrics = ? WHERE song_id = ?";
        db.query(query, [data.title, data.artist, data.file_path, data.image_path, data.lyrics, songId], callback);
    },
};

module.exports = prod;
