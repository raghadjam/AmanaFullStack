import { NextResponse } from 'next/server';
import clientPromise from '@/app/utils/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('amanaDB');

    // Fetch all books from MongoDB
    const books = await db.collection('books').find({}).toArray();

    return NextResponse.json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
