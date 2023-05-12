const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        set : (val)=> val.trim()
    }
})

module.exports = mongoose.model('Author', authorSchema)