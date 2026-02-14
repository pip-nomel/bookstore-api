import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Book } from '../lib/types';

export default function BookDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', id],
    queryFn: () => api.get(`/books/${id}`).then((r) => r.data.data as Book),
  });

  const addReview = useMutation({
    mutationFn: () => api.post(`/books/${id}/reviews`, { rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', id] });
      setComment('');
      setRating(5);
      setReviewError('');
    },
    onError: (err: any) => setReviewError(err.response?.data?.message || 'Failed to add review'),
  });

  const deleteReview = useMutation({
    mutationFn: (reviewId: number) => api.delete(`/reviews/${reviewId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['book', id] }),
  });

  const deleteBook = useMutation({
    mutationFn: () => api.delete(`/books/${id}`),
    onSuccess: () => navigate('/books'),
  });

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;
  if (!book) return <p className="text-center mt-10">Book not found</p>;

  const avgRating = book.reviews?.length
    ? (book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length).toFixed(1)
    : 'No ratings';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/books" className="text-blue-600 hover:underline mb-4 inline-block">← Back to books</Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-100 rounded-lg flex items-center justify-center h-64 text-6xl">📖</div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-gray-600 text-lg mb-1">by {book.author}</p>
          <p className="text-sm text-gray-400 mb-2">ISBN: {book.isbn}</p>
          <p className="text-sm text-gray-500 mb-4">Category: {book.category?.name}</p>
          <p className="text-2xl font-bold text-green-700 mb-2">${book.price.toFixed(2)}</p>
          <p className="text-sm mb-4">{book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}</p>
          <p className="text-sm text-yellow-600 mb-4">⭐ {avgRating}</p>

          {user && book.stock > 0 && (
            <button onClick={() => addItem(book)} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Add to Cart</button>
          )}
          {isAdmin && (
            <div className="flex gap-2 mt-4">
              <Link to={`/admin/books/${book.id}/edit`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</Link>
              <button onClick={() => { if (confirm('Delete this book?')) deleteBook.mutate(); }} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Reviews ({book.reviews?.length || 0})</h2>

        {user && (
          <div className="border rounded p-4 mb-6">
            <h3 className="font-semibold mb-2">Write a Review</h3>
            {reviewError && <p className="text-red-600 text-sm mb-2">{reviewError}</p>}
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm">Rating:</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border rounded px-2 py-1">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ⭐</option>)}
              </select>
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Your review..." className="w-full border rounded px-3 py-2 mb-2" rows={3} />
            <button onClick={() => addReview.mutate()} disabled={!comment.trim()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              Submit Review
            </button>
          </div>
        )}

        <div className="space-y-4">
          {book.reviews?.map((review) => (
            <div key={review.id} className="border rounded p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{review.user?.name}</p>
                  <p className="text-yellow-600">{'⭐'.repeat(review.rating)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  {(user?.id === review.userId || isAdmin) && (
                    <button onClick={() => deleteReview.mutate(review.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
