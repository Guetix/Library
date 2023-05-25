const mongoose = require('mongoose')
const path = require('node:path')

const imagesPath = '/uploads/authorImages'

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        match: [/^[a-zA-Z]/, 'Please enter a valid name'],
        unique: true,
        trim: true
    },
    imageName: {
        type: String,
        required: true,
    },
    about: {
        type: String,
        required: true,
        trim: true
    }
})

authorSchema.virtual('imagePath').get(function () {
    return path.join(imagesPath, this.imageName)
})



module.exports = mongoose.model('Author', authorSchema)
module.exports.imagesPath = imagesPath