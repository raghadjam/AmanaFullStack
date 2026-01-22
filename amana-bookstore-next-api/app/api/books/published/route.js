import { readJSON } from '@/utils/helpers'
import path from 'path'

const booksPath = path.join(process.cwd(), 'app', 'data', 'books.json')

export async function GET(req) {
  const books = readJSON(booksPath).books
  const url = new URL(req.url)
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  if (!start || !end) return new Response(JSON.stringify({ message:'Provide start and end dates' }), { status:400 })

  const startDate = new Date(start)
  const endDate = new Date(end)
  const result = books.filter(b => {
    const pub = new Date(b.datePublished)
    return pub >= startDate && pub <= endDate
  })
  return new Response(JSON.stringify(result), { status:200 })
}
