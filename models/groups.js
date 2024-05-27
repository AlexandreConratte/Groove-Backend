const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    name: String,
    members:[{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    festival: { type: mongoose.Schema.Types.ObjectId, ref: 'festivals' },
    participant:[{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: [] }],
    hesitate:[{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: [] }],
    impossible:[{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: [] }],
});

const Group = mongoose.model('groups', groupSchema);

module.exports = Group;