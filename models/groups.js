const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    name: String,
    members:[{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    festival: { type: mongoose.Schema.Types.ObjectId, ref: 'festivals' },
});

const Group = mongoose.model('groups', groupSchema);

module.exports = Group;