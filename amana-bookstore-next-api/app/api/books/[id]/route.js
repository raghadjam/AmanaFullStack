import { readJSON } from '@/utils/helpers'
import path from 'path'

const booksPath = path.join(process.cwd(), 'app', 'data', 'books.json')
let books = readJSON(booksPath).books

export async function GET(req, { params }) {
  const id = params.id
  const book = books.find(b => b.id.toString() === id)
  if (!book) return new Response(JSON.stringify({ message: 'Book not found' }), { status: 404 })
  return new Response(JSON.stringify(book), { status: 200 })
}
