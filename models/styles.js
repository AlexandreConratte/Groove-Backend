const mongoose = require('mongoose');

const styleSchema = mongoose.Schema({
    name: String,
});

const Style = mongoose.model('styles', styleSchema);

module.exports = Style;