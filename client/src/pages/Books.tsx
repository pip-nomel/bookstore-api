import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { addToWishlist, removeFromWishlist, getWishlist } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Book, Category, Pagination, WishlistItem } from '../lib/types';
import StarRating from '../components/StarRating';
import SearchSuggestions from '../components/SearchSuggestions';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, ShoppingCartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const gradients = [
  'from-violet-600 to-indigo-600',
  'from-emerald-600 to-teal-600',
  'from-orange-600 to-red-600',
  'from-blue-600 to-cyan-600',
  'from-pink-600 to-rose-600',
  'from-amber-600 to-yellow-600',
];

function BookSkeleton() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
        <div className="h-3 bg-gray-700 rounded w-1/4" />
        <div className="h-8 bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export default function Books() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const { isAdmin, user } = useAuth();
  const { addItem } = useCart();

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data as Category[]),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['books', search, categoryId, page],
    queryFn: () =>
      api.get('/books', { params: { search: search || undefined, categoryId: categoryId || undefined, page, limit: 12 } })
        .then((r) => r.data as { data: Book[]; pagination: Pagination }),
  });

  const { data: wishlist, refetch: refetchWishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => getWishlist() as Promise<WishlistItem[]>,
    enabled: !!user,
  });

  const wishlistIds = new Set(wishlist?.map((w) => w.bookId) || []);

  const toggleWishlist = async (bookId: number) => {
    try {
      if (wishlistIds.has(bookId)) {
        await removeFromWishlist(bookId);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(bookId);
        toast.success('Added to wishlist');
      }
      refetchWishlist();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Books</h1>
        {isAdmin && (
          <Link to="/admin/books/new" className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-500 transition-colors font-medium text-sm">
            + Add Book
          </Link>
        )}
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <input
            type="text" placeholder="Search books..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-gray-500"
          />
          <SearchSuggestions query={search} onSelect={(q) => setSearch(q)} />
        </div>
        <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className="bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
          <option value="">All Categories</option>
          {categoriesData?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <BookSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data?.data.map((book, idx) => {
              const avgRating = book.avgRating ?? (book.reviews?.length
                ? book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length
                : 0);

              return (
                <div key={book.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-all duration-200 group">
                  <Link to={`/books/${book.id}`}>
                    <div className={`h-48 bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center relative`}>
                      <span className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity">📖</span>
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-xs font-medium truncate drop-shadow-lg">{book.category?.name}</p>
                      </div>
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <Link to={`/books/${book.id}`} className="font-semibold text-gray-100 hover:text-emerald-400 transition-colors text-sm leading-tight flex-1 mr-2">
                        {book.title}
                      </Link>
                      {user && (
                        <button onClick={() => toggleWishlist(book.id)} className="shrink-0">
                          {wishlistIds.has(book.id)
                            ? <HeartSolid className="w-5 h-5 text-red-500" />
                            : <HeartOutline className="w-5 h-5 text-gray-500 hover:text-red-400 transition-colors" />
                          }
                        </button>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{book.author}</p>
                    {avgRating > 0 && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <StarRating rating={avgRating} />
                        <span className="text-gray-500 text-xs">({avgRating.toFixed(1)})</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-emerald-400">${book.price.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">{book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}</span>
                    </div>
                    {user && book.stock > 0 && (
                      <button onClick={() => { addItem(book); toast.success('Added to cart'); }}
                        className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2">
                        <ShoppingCartIcon className="w-4 h-4" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: data.pagination.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    page === i + 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
