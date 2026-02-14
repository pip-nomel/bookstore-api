import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkout = async () => {
    if (!user) return navigate('/login');
    setLoading(true);
    setError('');
    try {
      await api.post('/orders', {
        items: items.map((i) => ({ bookId: i.book.id, quantity: i.quantity })),
      });
      clearCart();
      navigate('/orders');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl mb-4">🛒 Your cart is empty</p>
        <button onClick={() => navigate('/books')} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Browse Books</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.book.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{item.book.title}</h3>
              <p className="text-sm text-gray-500">{item.book.author}</p>
              <p className="text-green-700 font-bold">${item.book.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateQuantity(item.book.id, item.quantity - 1)} className="bg-gray-200 px-2 py-1 rounded">-</button>
              <span className="font-semibold">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.book.id, item.quantity + 1)} className="bg-gray-200 px-2 py-1 rounded">+</button>
              <span className="font-bold ml-4">${(item.book.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => removeItem(item.book.id)} className="text-red-500 ml-2 hover:underline text-sm">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-4 flex justify-between items-center">
        <span className="text-2xl font-bold">Total: ${total.toFixed(2)}</span>
        <button onClick={checkout} disabled={loading} className="bg-green-600 text-white px-8 py-3 rounded text-lg hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}
