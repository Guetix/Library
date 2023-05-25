const express = require('express')
const router = express.Router()
const path = require('node:path')
const fs = require('node:fs')
const Author = require('../models/author')
const Book = require('../models/book')

const multer = require('multer')
const uploadingPath = path.join('public', Author.imagesPath)
const imagesMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const upload = multer({
    dest: uploadingPath,
    fileFilter: function (res, file, cb) {
        cb(null, imagesMimeTypes.includes(file.mimetype))
    }
})

// To add a new Authors
router.get('/new', (req, res) => {
    res.render('./authors/newAuthor', { author: new Author() })
})
router.route('/')
    // Get all the Authors from Db
    .get(async (req, res) => {
        let searchOptions = {}
        if (req.query._search !== null && req.query._search !== '') {
            searchOptions.name = new RegExp(req.query._search, 'i')
        }
        try {
            const authorsList = await Author.find(searchOptions)
            res.render('./authors/index', {
                authorsList,
                searchOptions: req.query
            })
        } catch (err) {
            res.redirect('/')
        }

    })
    // Create author
    .post(upload.single('authorImage'), async (req, res) => {
        const fileName = req.file ? req.file.filename : null
        const author = new Author({
            name: req.body.name,
            imageName: fileName,
            about: req.body.about
        })
        try {
            await author.save()
            res.redirect('/authors/new')
        } catch (err) {
            removeAuthorImage(author.imageName)
            res.status(500).render('./authors/newAuthor', {
                author: author,
                errorMessage: checkError(err)
            })
        }
    })
function checkError(err) {
    let error = 'Error Creating Author !'
    if (err.name === 'MongoServerError' && err.code === 11000) {
        return error = 'The Name Is Already Exists'
    }
    if (err._message === 'Author validation failed') {
        return error = "Please enter a valid name"
    }
    return error
}

//form to set and send a new name  to .put(/:id)
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('./authors/editAuthor', { author })
    } catch {
        res.redirect('/authors')
    }
})

//author Read, Update, Delete
router.route('/:id')
    .get(async (req, res) => {
        try {
            const author = await Author.findById(req.params.id)
            const booksList = await Book.find({ author: author.id }).limit(5).exec()
            res.render('./authors/showAuthor', { author, booksList })
        } catch {
            res.redirect('/authors')
        }
    })
    .put(upload.single('authorImage'), async (req, res) => {
        let fileName = req.file ? req.file.filename : null
        let author
        try {
            author = await Author.findById(req.params.id)
            author.name = req.body.name
            author.about = req.body.about
            if (fileName != null) {
                removeAuthorImage(author.imageName)
                console.log(fileName)
                author.imageName = fileName
            }
            await author.save()
            res.redirect(`/authors/${author.id}`)
        } catch {
            if (author == null) {
                res.redirect(`/authors`)
            }
            res.render(`./authors/editAuthor`, {
                author,
                errorMessage: 'Error Updating Author'
            })
        }
    })
    .delete(preRemove, async (req, res) => {
        try {
            if (req.res.locals.cantDel) {
                const { booksList } = req.res.locals
                const author = await Author.findById(req.params.id)
                res.render(`./authors/showAuthor`, {
                    author,
                    booksList,
                    errorMessage: 'Error Deleting Author! This Author Has Books Still, '
                })
                return
            }
            const author = await Author.findByIdAndDelete({ _id: req.params.id })
            removeAuthorImage(author.imageName)
            res.redirect('/authors')
        } catch {
            res.redirect('/authors')
        }
    })

function removeAuthorImage(fileName) {
    fs.unlink(path.join(uploadingPath, fileName), err => {
        if (err) console.error(err)
    })
}
// middleware Runs before deleting the author
async function preRemove(req, res, next) {
    let booksList;
    try {
        booksList = await Book.find({ author: req.params.id })
        if (booksList.length > 0) {
            res.locals.cantDel = true
            res.locals.booksList = booksList
            return next()
        }
        next()
    } catch {
        res.redirect('/')
    }
}


module.exports = router