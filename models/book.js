const mongoose = require('mongoose')
const path = require('node:path')

const coverImagesPath = '/uploads/coverImages'

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        set : (val)=> val.trim()
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    },
    description: {
        type: String,
        set : (val)=> val.trim()
    },
    publishDate: {
        type: Date,
        required: true,
    },
    pageCount: {
        type: Number,
        required: true,
    },
    coverImageName: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})
bookSchema.virtual('coverImagePath').get(function () {
   return path.join(coverImagesPath , this.coverImageName)
})

module.exports = mongoose.model('Book', bookSchema)
module.exports.coverImagesPath = coverImagesPath