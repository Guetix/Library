const express = require('express')
const router = express.Router()
const book = require('../models/book')
const path = require('node:path')

router.get('/', async (req, res) => {
    let books;
    try {
        books = await book.find({}).sort({ createdAt: 'desc' }).limit(5)
    } catch {
        books = []
    }
    res.render('mainPage', { books })
})

module.exports = router