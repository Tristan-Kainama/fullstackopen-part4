const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controller/notes')

const app = express()

app.use(express.json())

logger.info('Connecting to', config.MONGODB_URI)

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

mongoose.connect(config.MONGODB_URI, { family: 4 })
.then(() => {
    logger.info('Connected to MongoDB')
})
.catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message)
})

app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app