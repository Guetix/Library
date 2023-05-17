const express = require('express');
const app = express()
const expressLayouts = require('express-ejs-layouts')
require('dotenv').config()

const indexRouter = require('./routers/router')
const authorsIndex = require('./routers/authorsRouter')
const booksIndex = require('./routers/booksRouter')

app.set("view engine", "ejs")
app.set("views", __dirname + "/views")
app.set("layout", "layouts/layout")
app.use(expressLayouts)
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Mongodb connected !'))
    .catch(err => console.log(err.message))

app.use('/', indexRouter)
app.use('/authors', authorsIndex)
app.use('/books', booksIndex)


const cors = require('cors')
app.use(cors())

const {
    data,
    getLivre,
    addLivre,
    updateLivre,
    deleteLivre } = require('./moduleBook')
app.get('/cata', (req, res) => {
    res.json(data)
})
app.get('/livres/:id', (req, res) => {
    const val = getLivre(req.params.id)
    if (val) {
        res.json(val)
    } else {
        res.status(404).send('passe en parametre')
    }
})
app.route('/livre')
    .post((req, res) => {
        const data = addLivre(req.query)
        res.json(data)
    })
    .put((req, res) => {
        const data = updateLivre(req.query)
        res.json(data)
    })
    .delete((req, res) => {
        const data = deleteLivre(req.query)
        res.json(data)
    })





app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running")
})