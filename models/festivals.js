const mongoose = require('mongoose');

const adressSchema= mongoose.Schema({
    place: String,
    city: String,
    latitude: Number,
    longitude: Number,
})

const festivalSchema = mongoose.Schema({
    name: String,
    start: Date,
    end: Date,
    averageParticipant: Number,
    description: String,
    moreAbout: String,
    pictures: [String],
    styles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'styles' }],
    nbLikes: [String],
    artists:[{ type: mongoose.Schema.Types.ObjectId, ref: 'artists' }],
    adress: adressSchema,
});

const Festival = mongoose.model('festivals', festivalSchema);

module.exports = Festival;