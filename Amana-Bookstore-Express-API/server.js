const express = require('express')
const fs = require('fs')
const path = require('path')
const morgan = require('morgan')
const app = express()
const PORT = process.env.PORT || 3000

const { authenticate } = require('./utils/auth') // import middleware


// Import data
const booksData = require('./data/books.json')
const reviewsData = require('./data/reviews.json')

const books = booksData.books
const reviews = reviewsData.reviews

const logStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })
app.use(morgan('combined', { stream: logStream })) // write logs to log.txt
app.use(morgan('dev')) // optional: log to console

app.use(express.json())

// 1. Get all books
app.get('/books', (req, res) => {
  res.json(books)
})

// 3. Get books published between date range
app.get('/books/published', (req, res) => {
  const { start, end } = req.query

  if (!start || !end) {
    return res.status(400).json({ message: "Please provide start and end dates" })
  }

  const startDate = new Date(start)
  const endDate = new Date(end)

  const result = books.filter(book => {
    const pubDate = new Date(book.datePublished)
    return pubDate >= startDate && pubDate <= endDate
  })

  res.json(result)
})


// 5. Get featured books
app.get('/books/featured', (req, res) => {
  const result = books.filter(book => book.featured === true)
  res.json(result)
})


// 4. Get top 10 rated books (rating * reviewCount)
app.get('/books/top-rated', (req, res) => {
  const sortedBooks = [...books]
    .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
    .slice(0, 10)

  res.json(sortedBooks)
})

// 2. Get a single book by ID
app.get('/books/:id', (req, res) => {
  const id = req.params.id
  const book = books.find(b => b.id === id)
  if (!book) {
    return res.status(404).json({message: 'Book not found'})
  }
  res.json(book)
})

// 6. Get all reviews for a specific book ID
app.get('/books/:id/reviews', (req, res) => {
  const id = req.params.id
  const result = reviews.filter(r => r.bookId === id)
  res.json(result)
})

// POST a new book
app.post('/books', authenticate, (req, res) => {
  const newBook = req.body

  if (!newBook.title || !newBook.author) {
    return res.status(400).json({ message: "Book must include title and author" })
  }

  // Auto-generate ID
  newBook.id = books.length ? (parseInt(books[books.length - 1].id) + 1).toString() : "1"
  newBook.reviews = []
  newBook.reviewCount = 0

  books.push(newBook)

  // Save to JSON
  fs.writeFileSync('./data/books.json', JSON.stringify({ books }, null, 2))

  res.status(201).json({ message: "Book added successfully", book: newBook })
})


// Add a new review for a book
app.post('/books/:id/reviews', authenticate, (req, res) => {
  const bookId = req.params.id
  const book = books.find(b => b.id === bookId)

  if (!book) {
    return res.status(404).json({ message: "Book not found" })
  }

  const newReview = req.body
  if (!newReview.author || !newReview.rating) {
    return res.status(400).json({ message: "Review must include author and rating" })
  }

  // Auto-generate review ID
  newReview.id = `review-${Date.now()}`
  newReview.bookId = bookId
  newReview.timestamp = new Date().toISOString()

  reviews.push(newReview)
  book.reviewCount = (book.reviewCount || 0) + 1

  // Save both reviews and books (update reviewCount)
  fs.writeFileSync('./data/reviews.json', JSON.stringify({ reviews }, null, 2))
  fs.writeFileSync('./data/books.json', JSON.stringify({ books }, null, 2))

  res.status(201).json({ message: "Review added successfully", review: newReview })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
