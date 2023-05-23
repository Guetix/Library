const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')

// To add a new Authors
router.get('/new', (req, res) => {
    res.render('./authors/newAuthor', { author: new Author() })
})
router.route('/')
    .get(async (req, res) => {  // Get Authors
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
    .post(async (req, res) => { // Add Author
        const author = new Author({
            name: req.body.name
        })
        try {
            await author.save()
            res.redirect('/authors/new')
        } catch (err) {
            let error = 'Error Creating Author !'
            if (err.name === 'MongoServerError' && err.code === 11000) {
                error = 'The Name Is Already Exists'
            }
            res.status(500).render('./authors/newAuthor', {
                author: author,
                errorMessage: error
            })
        }
    })

router.get('/:id/edit', async (req, res) => { //send data to .put(/:id)
    try {
        const author = await Author.findById(req.params.id)
        res.render('./authors/editAuthor', { author })
    } catch {
        res.redirect('/authors')
    }
})
router.route('/:id')
    .get(async (req, res) => { //show an author 
        try {
            const author = await Author.findById(req.params.id)
            const booksList = await Book.find({ author: author.id }).limit(5).exec()
            res.render('./authors/showAuthor', { author, booksList })
        } catch {
            res.redirect('/authors')
        }
    })
    .put(async (req, res) => {
        let author
        try {
            author = await Author.findById(req.params.id)
            author.name = req.body.name
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
            await Author.deleteOne({ _id: req.params.id })
            res.redirect('/authors')
        } catch {
            res.redirect('/authors')
        }
    })

async function preRemove(req, res, next) {
    let booksList;
    try {
        booksList = await Book.find({ author: req.params.id })
        if (booksList.length <= 0) {
            return next()
        }
        let author = {}
        author.id = req.params.id
        res.render(`./authors/showAuthor`, { author, booksList, errorMessage: 'The Author Has Books Still, Error Deleting Author !' })
    } catch (err) {
        res.redirect('/')
    }
}


module.exports = router