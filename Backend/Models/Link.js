const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Link', linkSchema);
