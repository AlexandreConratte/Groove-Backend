const mongoose = require('mongoose');


const artistSchema = mongoose.Schema({
    name: String,
    picture: String,
});

const Artist = mongoose.model('artists', artistSchema);

module.exports = Artist;