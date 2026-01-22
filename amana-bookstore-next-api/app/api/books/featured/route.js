import { readJSON } from '@/utils/helpers'
import path from 'path'

const booksPath = path.join(process.cwd(), 'app', 'data', 'books.json')

export async function GET() {
  const books = readJSON(booksPath).books
  const featured = books.filter(b => b.featured)
  return new Response(JSON.stringify(featured), { status:200 })
}
