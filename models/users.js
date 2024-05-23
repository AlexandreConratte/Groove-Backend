const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: String,
    firstname: { type : String, default : null },
    lastname: { type : String, default : null },
    birthdate: Date,
    city: { type : String, default : null },
    styles: { type:[mongoose.Schema.Types.ObjectId], ref: 'styles', default: [] },
    artists: { type: [mongoose.Schema.Types.ObjectId], ref: 'artists',  default: [] },
    friends: { type: [mongoose.Schema.Types.ObjectId], ref: 'users', default: [] },
    likedFestivals: { type: [mongoose.Schema.Types.ObjectId], ref: 'festivals', default: [] },
    memoriesFestivals: { type: [mongoose.Schema.Types.ObjectId], ref: 'festivals', default: [] },
    picture: { type : String, default : null }

});

const User = mongoose.model('users', userSchema);

module.exports = User;