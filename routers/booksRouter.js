const express = require('express')
const router = express.Router()
const path = require('node:path')
const fs = require('node:fs')
const multer = require('multer')
const Book = require('../models/book')
const Author = require('../models/author')

const uploadingPath = path.join('public', Book.coverImagesPath)
const imagesMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const upload = multer({
  dest: uploadingPath, //the destination when the buffer will stored ,it'll save the file locally (to the filesystem)
  fileFilter: (req, file, callback) => {
    callback(null, imagesMimeTypes.includes(file.mimetype))
  }
})
// const storage = multer.memoryStorage() || if you don't set the dest option ,you'll get the buffer from the file object  
// const upload = multer({ storage: storage })


// form to create a new book
router.get('/new', (req, res) => {
  renderNewPage(res, new Book(), 'newBook')
})
router.route('/')
  // Read books from Db
  .get(async (req, res) => {
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
      const books = await query.exec()
      res.render('./books/index.ejs', {
        books,
        searchOptions: req.query
      })

    } catch {
      res.status(500).redirect('/')
    }
  })
  //Create book
  .post(upload.single('coverImage'), async (req, res) => {
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
      renderNewPage(res, book, 'newBook', true)
    }
  })


//form to Update the book, sending request to .put(/:id)
router.get('/:id/edit', async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id)
    renderNewPage(res, book, 'editBook')
  } catch {
    if (book == null) {
      res.redirect('/books')
      return
    }
    res.redirect('/')
  }

})

//book Read, Update, Delete
router.route('/:id')
  .get(async (req, res) => {
    let book
    try {
      book = await Book.findById(req.params.id).populate('author').exec()
      res.render('books/showBook', { book })
    } catch {
      res.status(500).redirect('/books')
    }
  })
  .put(upload.single('coverImage'), async (req, res) => {
    let fileName = req.file ? req.file.filename : null
    let book;
    try {
      book = await Book.findById(req.params.id)
      book.title = req.body.title
      book.author = req.body.author
      book.description = req.body.description
      book.publishDate = new Date(req.body.publishDate) //String to Date
      book.pageCount = req.body.pageCount
      if (fileName != null) {
        book.coverImageName = fileName
      }
      await book.save()
      res.redirect(`/books/${book._id}`)
    } catch {
      if (fileName != null) {
        removeBookCover(fileName)
      }
      if (book == null) {
        res.redirect('/books')
      }
      renderNewPage(res, book, 'editBook', true)
    }

  })
  .delete(async (req, res) => {
    try {
      let book = await Book.findByIdAndDelete({ _id: req.params.id })
      removeBookCover(book.coverImageName)
      res.redirect('/books')
    } catch {
      res.status(500).redirect('/books')
    }
  })


function removeBookCover(fileName) {
  fs.unlink(path.join(uploadingPath, fileName), err => {
    if (err) console.error(err)
  })
}

async function renderNewPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({})
    const options = { authors, book }
    if (hasError && form === 'newBook') {
      options.errorMessage = 'Failed To Add A New Book! Check Your Entered Data, And Try Again.'
    }
    if (hasError && form === 'editBook') {
      options.errorMessage = 'Error Updating Book, try again.'
    }

    res.render(`books/${form}`, options)
  } catch {
    res.status(500).redirect('/books')
  }
}

module.exports = router