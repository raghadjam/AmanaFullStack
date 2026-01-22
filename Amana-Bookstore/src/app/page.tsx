'use client';

import { useState, useEffect } from 'react';
import BookGrid from './components/BookGrid';
import { Book } from './types';

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('/api/books');
        if (!res.ok) throw new Error('Failed to fetch books');
        const data: Book[] = await res.json();
        setBooks(data);
      } catch (err) {
        console.error('Error fetching books:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

const handleAddToCart = async (bookId: string) => {
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, quantity: 1 }),
    });

    if (!res.ok) throw new Error('Failed to add to cart');

    console.log(`Book ${bookId} added to cart`);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  } catch (err) {
    console.error('Error adding book to cart:', err);
  }
};


  if (isLoading) return <div className="text-center py-10">Loading books...</div>;
  if (!books.length) return <div className="text-center py-10">No books available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center bg-purple-200 p-8 rounded-lg mb-12 shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Welcome to the Amana Bookstore!
        </h1>
        <p className="text-lg text-gray-600">
          Your one-stop shop for the best books. Discover new worlds and adventures.
        </p>
      </section>

      <BookGrid books={books} onAddToCart={handleAddToCart} />
    </div>
  );
}
