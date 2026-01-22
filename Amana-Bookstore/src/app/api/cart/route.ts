import { NextResponse } from 'next/server';
import clientPromise from '@/app/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('amanaDB');

    // Fetch all cart items (replace with user-specific query if needed)
    const cartItems = await db.collection('cart').find({}).toArray();

    return NextResponse.json(cartItems);
  } catch (err) {
    console.error('Error fetching cart items:', err);
    return NextResponse.json(
      { error: 'Failed to fetch cart items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('amanaDB');

    // Add item to cart collection
    const result = await db.collection('cart').insertOne(body);

    return NextResponse.json({
      message: 'Item added to cart successfully',
      item: result
    });
  } catch (err) {
    console.error('Error adding item to cart:', err);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('amanaDB');

    if (!body.id) {
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }

    const result = await db.collection('cart').updateOne(
      { _id: new ObjectId(body.id) },
      { $set: body }
    );

    return NextResponse.json({
      message: 'Cart item updated successfully',
      result
    });
  } catch (err) {
    console.error('Error updating cart item:', err);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('amanaDB');

    const result = await db.collection('cart').deleteOne({ _id: new ObjectId(itemId) });

    return NextResponse.json({
      message: 'Item removed from cart successfully',
      result
    });
  } catch (err) {
    console.error('Error removing cart item:', err);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}
