const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        match: [ /^[a-zA-Z]+\s?\w*$/, 'Please enter a valid name'],
        unique: true,
        trim: true
    }
})



module.exports = mongoose.model('Author', authorSchema)