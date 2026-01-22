import { authenticate } from '@/utils/auth'
import { readJSON } from '@/utils/helpers'
import path from 'path'

const booksPath = path.join(process.cwd(), 'app', 'data', 'books.json')
const reviewsPath = path.join(process.cwd(), 'app', 'data', 'reviews.json')

let books = readJSON(booksPath).books
let reviews = readJSON(reviewsPath).reviews

export async function GET(req, { params }) {
  const id = params.id
  const book = books.find(b => b.id.toString() === id)
  if (!book) return new Response(JSON.stringify({ message: 'Book not found' }), { status: 404 })

  const bookReviews = reviews.filter(r => r.bookId === id)
  return new Response(JSON.stringify(bookReviews), { status: 200 })
}

export async function POST(req, { params }) {
  try { authenticate(req) } catch(e) {
    return new Response(JSON.stringify({ message: e.message }), { status: 403 })
  }

  const id = params.id
  const book = books.find(b => b.id.toString() === id)
  if (!book) return new Response(JSON.stringify({ message: 'Book not found' }), { status: 404 })

  const body = await req.json()
  if (!body.author || !body.rating)
    return new Response(JSON.stringify({ message: 'Review must include author and rating' }), { status: 400 })

  const newReview = { ...body, id: `review-${Date.now()}`, bookId: id, timestamp: new Date().toISOString() }
  reviews.push(newReview)
  book.reviewCount = (book.reviewCount || 0) + 1

  return new Response(JSON.stringify({ message: 'Review added', review: newReview }), { status: 201 })
}
