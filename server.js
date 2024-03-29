const express = require('express');
const app = express()
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
require('dotenv').config()

const indexRouter = require('./routers/router')
const authorsIndex = require('./routers/authorsRouter')
const booksIndex = require('./routers/booksRouter')

app.set("view engine", "ejs")
app.set("views", __dirname + "/views")
app.set("layout", "layouts/layout")
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static("public"))
app.use('/resource' , express.static("resource") )
app.use(express.urlencoded({ extended: true }))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Mongodb connected !'))
    .catch(err => console.log(err.message))

app.use('/', indexRouter)
app.use('/authors', authorsIndex)
app.use('/books', booksIndex)


app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running")
})