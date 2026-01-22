// src/app/api/books/[id]/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/app/utils/mongodb';

export async function GET(_req: Request, context: any) {
  const bookId = context.params.id;

  try {
    const client = await clientPromise;
    const db = client.db('amanaDB');

    const book = await db
      .collection('books')
      .findOne({ id: bookId });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (err) {
    console.error('Error fetching book:', err);
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}
