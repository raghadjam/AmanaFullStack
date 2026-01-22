import { NextResponse } from 'next/server';
import clientPromise from '@/app/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('amanaDB');

    // Fetch all reviews from MongoDB
    const reviews = await db.collection('reviews').find({}).toArray();

    return NextResponse.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('amanaDB');

    // Add a new review
    const result = await db.collection('reviews').insertOne({
      ...body,
      _id: new ObjectId(), // generate unique ID
      timestamp: new Date().toISOString() // optional timestamp
    });

    return NextResponse.json({
      message: 'Review added successfully',
      review: result
    });
  } catch (err) {
    console.error('Error adding review:', err);
    return NextResponse.json(
      { error: 'Failed to add review' },
      { status: 500 }
    );
  }
}
