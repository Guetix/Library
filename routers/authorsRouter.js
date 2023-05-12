const express = require('express')
const router = express.Router()
const Author = require('../models/author')



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
// To add a new Authors
router.get('/new', (req, res) => {
    res.render('./authors/newAuthor', { author: new Author() })
})

module.exports = router