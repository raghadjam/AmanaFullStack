// src/app/api/books/[id]/reviews/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/app/utils/mongodb';

// Use context: any to bypass TS typing quirk
export async function GET(_req: Request, context: any) {
  const bookId = context.params.id;

  try {
    const client = await clientPromise;
    const db = client.db('amanaDB');

    const reviews = await db
      .collection('reviews')
      .find({ bookId })
      .toArray();

    return NextResponse.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
