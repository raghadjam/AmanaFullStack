'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartItem from '../components/CartItem';
import { Book } from '../types';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<{ book: Book; quantity: number; _id?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart from API
  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart');
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data: { _id: string; bookId: string; quantity: number }[] = await res.json();

      // Fetch all books to match bookIds
      const booksRes = await fetch('/api/books');
      if (!booksRes.ok) throw new Error('Failed to fetch books');
      const booksData: Book[] = await booksRes.json();

      const itemsWithBooks = data
        .map(item => {
          const book = booksData.find(b => b.id === item.bookId);
          return book ? { book, quantity: item.quantity, _id: item._id } : null;
        })
        .filter((item): item is { book: Book; quantity: number; _id: string } => item !== null);

      setCartItems(itemsWithBooks);
    } catch (err) {
      console.error(err);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();

    // Refresh whenever an item is added
    const handler = () => fetchCart();
    window.addEventListener('cartUpdated', handler);
    return () => window.removeEventListener('cartUpdated', handler);
  }, []);

  // Remove item from cart
  const removeItem = async (bookId: string) => {
    const item = cartItems.find(ci => ci.book.id === bookId);
    if (!item || !item._id) return;

    try {
      const res = await fetch(`/api/cart?itemId=${item._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove item');

      // Update frontend state
      setCartItems(prev => prev.filter(ci => ci.book.id !== bookId));
    } catch (err) {
      console.error('Error removing cart item:', err);
    }
  };

  const updateQuantity = async (bookId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = cartItems.find(ci => ci.book.id === bookId);
    if (!item || !item._id) return;

    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item._id, quantity: newQuantity }),
      });
      if (!res.ok) throw new Error('Failed to update quantity');

      setCartItems(prev =>
        prev.map(ci => (ci.book.id === bookId ? { ...ci, quantity: newQuantity } : ci))
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.book.price * item.quantity, 0);

  if (isLoading) return <div className="text-center py-10">Loading cart...</div>;
  if (!cartItems.length)
    return <div className="text-center py-10">Your cart is empty</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      <div className="bg-white rounded-lg shadow-md">
        {cartItems.map(item => (
          <CartItem
            key={item.book.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem} // <-- now works
          />
        ))}
      </div>
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center text-xl font-bold mb-4 text-gray-800">
          <span>Total: ${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-gray-500 text-white text-center py-3 rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
