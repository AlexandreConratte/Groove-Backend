const mongoose = require('mongoose');


const artistSchema = mongoose.Schema({
    name: String,
    picture: String,
    styles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'styles' }],
});

const Artist = mongoose.model('artists', artistSchema);

module.exports = Artist;