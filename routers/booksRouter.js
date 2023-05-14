const express = require('express')
const router = express.Router()
const path = require('node:path')
const fs = require('node:fs')
const multer = require('multer')
const Book = require('../models/book')
const Author = require('../models/author')

const uploadingPath = path.join('public', Book.coverImagesPath)
const imagesMimeTypes = ['image/jpeg', 'images/png', 'images/gif']
const upload = multer({
  dest: uploadingPath,
  fileFilter: (req, file, callback) => {
    callback(null, imagesMimeTypes.includes(file.mimetype))
  }
})
// add enctype="multipart/form-data" to the form
// pass the meddleware upload.single('coverImage') to the route with the name of input 'coverImage'

router.route('/')
  .get(async (req, res) => {   // Get Books
    const { _title, _publishAfter, _publishBefore } = req.query
    let query = Book.find()
    if (_title != null && _title != '') {
      query = query.regex('title', new RegExp(_title, 'i'))
    }
    if (_publishAfter != null && _publishAfter != '') {
      query = query.gte('publishDate', new Date(_publishAfter))
    }
    if (_publishBefore != null && _publishBefore != '') {
      query = query.lte('publishDate', new Date(_publishBefore))
    }

    try {
      const books = await query.populate('author', 'name').exec()
      res.render('./books/index.ejs', {
        books,
        searchOptions: req.query
      })

    } catch {
      res.status(500).redirect('/')
    }
  })

  .post(upload.single('coverImage'), async (req, res) => {  // Add Book
    let fileName = req.file != null ? req.file.filename : null
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      publishDate: new Date(req.body.publishDate), //String to Date
      pageCount: req.body.pageCount,
      coverImageName: fileName
    })
    try {
      await book.save()
      res.redirect('/books/new')
    } catch (err) {
      if (book.coverImageName != null) {
        removeBookCover(fileName)
      }
      renderNewPage(res, book, true)
    }
  })

router.get('/new', (req, res) => { // To add a new Book
  renderNewPage(res, new Book())
})


function removeBookCover(fileName) {
  fs.unlink(path.join(uploadingPath, fileName), err => {
    if (err) console.error(err)
  })
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({})
    const options = { authors, book }
    if (hasError) {
      options.errorMessage = 'something goes wrong, try agin.'
    }
    res.render('./books/newBook', options)
  } catch {
    res.status(500).redirect('/books')
  }
}

module.exports = router