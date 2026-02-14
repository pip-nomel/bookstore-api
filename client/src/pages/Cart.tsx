import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { validateCoupon } from '../lib/api';
import api from '../lib/api';
import { CouponValidation } from '../lib/types';
import { TrashIcon, MinusIcon, PlusIcon, TagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState('');

  const applyCoupon = async () => {
    setCouponError('');
    setCoupon(null);
    try {
      const result = await validateCoupon(couponCode, total);
      setCoupon(result);
      toast.success(`Coupon applied! You save $${result.discount.toFixed(2)}`);
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const checkout = async () => {
    if (!user) return navigate('/login');
    setLoading(true);
    setError('');
    try {
      await api.post('/orders', {
        items: items.map((i) => ({ bookId: i.book.id, quantity: i.quantity })),
        couponCode: coupon?.code,
      });
      clearCart();
      toast.success('Order placed successfully!');
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
        <p className="text-4xl mb-4">🛒</p>
        <p className="text-xl text-gray-300 mb-6">Your cart is empty</p>
        <button onClick={() => navigate('/books')} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-500 transition-colors font-medium">
          Browse Books
        </button>
      </div>
    );
  }

  const finalTotal = coupon ? coupon.finalTotal : total;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Shopping Cart</h1>
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.book.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex justify-between items-center hover:border-gray-600 transition-colors">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-100">{item.book.title}</h3>
              <p className="text-sm text-gray-400">{item.book.author}</p>
              <p className="text-emerald-400 font-bold mt-1">${item.book.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1">
                <button onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                  className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors">
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="font-semibold text-gray-100 w-8 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                  className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors">
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <span className="font-bold text-gray-100 w-20 text-right">${(item.book.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => removeItem(item.book.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TagIcon className="w-5 h-5 text-gray-400" />
          <span className="text-gray-300 font-medium text-sm">Have a coupon?</span>
        </div>
        <div className="flex gap-3">
          <input
            type="text" placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500"
          />
          <button onClick={applyCoupon} disabled={!couponCode.trim()}
            className="bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 px-5 py-2.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-all font-medium text-sm disabled:opacity-50">
            Apply
          </button>
        </div>
        {couponError && <p className="text-red-400 text-sm mt-2">{couponError}</p>}
        {coupon && (
          <div className="mt-3 text-emerald-400 text-sm">
            ✓ Coupon <strong>{coupon.code}</strong> applied — {coupon.type === 'PERCENTAGE' ? `${coupon.value}% off` : `$${coupon.value} off`} (−${coupon.discount.toFixed(2)})
          </div>
        )}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          {coupon && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount</span>
              <span>−${coupon.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-gray-700 pt-2 flex justify-between text-xl font-bold text-gray-100">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={checkout} disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50">
          {loading ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}
