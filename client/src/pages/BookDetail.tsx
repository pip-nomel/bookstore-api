import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { addToWishlist, removeFromWishlist, getWishlist } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Book, WishlistItem } from '../lib/types';
import StarRating from '../components/StarRating';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, ShoppingCartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-24 mb-6" />
      <div className="grid md:grid-cols-2 gap-10">
        <div className="h-80 bg-gray-700 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-700 rounded w-1/2" />
          <div className="h-4 bg-gray-700 rounded w-1/3" />
          <div className="h-10 bg-gray-700 rounded w-1/4" />
          <div className="h-12 bg-gray-700 rounded w-40" />
        </div>
      </div>
    </div>
  );
}

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

  const { data: wishlist, refetch: refetchWishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => getWishlist() as Promise<WishlistItem[]>,
    enabled: !!user,
  });

  const isWishlisted = wishlist?.some((w) => w.bookId === Number(id));

  const addReview = useMutation({
    mutationFn: () => api.post(`/books/${id}/reviews`, { rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', id] });
      setComment('');
      setRating(5);
      setReviewError('');
      toast.success('Review submitted!');
    },
    onError: (err: any) => setReviewError(err.response?.data?.message || 'Failed to add review'),
  });

  const deleteReview = useMutation({
    mutationFn: (reviewId: number) => api.delete(`/reviews/${reviewId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', id] });
      toast.success('Review deleted');
    },
  });

  const deleteBook = useMutation({
    mutationFn: () => api.delete(`/books/${id}`),
    onSuccess: () => navigate('/books'),
  });

  const toggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(Number(id));
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(Number(id));
        toast.success('Added to wishlist');
      }
      refetchWishlist();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (isLoading) return <DetailSkeleton />;
  if (!book) return <p className="text-center mt-10 text-gray-400">Book not found</p>;

  const avgRating = book.avgRating ?? (book.reviews?.length
    ? book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length
    : 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/books" className="text-emerald-400 hover:text-emerald-300 transition-colors mb-6 inline-block text-sm">
        ← Back to books
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center h-80">
          <span className="text-8xl opacity-30">📖</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">{book.title}</h1>
          <p className="text-gray-400 text-lg mb-1">by {book.author}</p>
          <p className="text-sm text-gray-600 mb-1">ISBN: {book.isbn}</p>
          <p className="text-sm text-gray-500 mb-4">{book.category?.name}</p>

          {avgRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={avgRating} size="md" />
              <span className="text-gray-400 text-sm">({avgRating.toFixed(1)} · {book.reviews?.length} reviews)</span>
            </div>
          )}

          <p className="text-3xl font-bold text-emerald-400 mb-2">${book.price.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mb-6">
            {book.stock > 0
              ? <span className="text-emerald-400">{book.stock} in stock</span>
              : <span className="text-red-400">Out of stock</span>
            }
          </p>

          <div className="flex gap-3">
            {user && book.stock > 0 && (
              <button onClick={() => { addItem(book); toast.success('Added to cart'); }}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-500 transition-colors font-medium flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5" />
                Add to Cart
              </button>
            )}
            {user && (
              <button onClick={toggleWishlist}
                className={`px-4 py-2.5 rounded-lg border transition-all ${
                  isWishlisted
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-red-500/30 hover:text-red-400'
                }`}>
                {isWishlisted ? <HeartSolid className="w-5 h-5" /> : <HeartOutline className="w-5 h-5" />}
              </button>
            )}
          </div>

          {isAdmin && (
            <div className="flex gap-2 mt-4">
              <Link to={`/admin/books/${book.id}/edit`} className="bg-amber-600/20 text-amber-400 border border-amber-600/30 px-4 py-2 rounded-lg hover:bg-amber-600 hover:text-white transition-all text-sm">
                Edit
              </Link>
              <button onClick={() => { if (confirm('Delete this book?')) deleteBook.mutate(); }}
                className="bg-red-600/20 text-red-400 border border-red-600/30 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all text-sm">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Reviews ({book.reviews?.length || 0})</h2>

        {user && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-200 mb-4">Write a Review</h3>
            {reviewError && <p className="text-red-400 text-sm mb-3">{reviewError}</p>}
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-gray-400">Rating:</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}
                className="bg-gray-900 border border-gray-700 text-gray-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ⭐</option>)}
              </select>
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Your review..."
              className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500" rows={3} />
            <button onClick={() => addReview.mutate()} disabled={!comment.trim()}
              className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
              Submit Review
            </button>
          </div>
        )}

        <div className="space-y-4">
          {book.reviews?.map((review) => (
            <div key={review.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-200">{review.user?.name}</p>
                  <StarRating rating={review.rating} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  {(user?.id === review.userId || isAdmin) && (
                    <button onClick={() => deleteReview.mutate(review.id)} className="text-red-400 text-xs hover:text-red-300 transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-gray-300 text-sm">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
