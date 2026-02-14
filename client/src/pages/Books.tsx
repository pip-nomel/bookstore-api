import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Book, Category, Pagination } from '../lib/types';

export default function Books() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const { isAdmin } = useAuth();
  const { addItem } = useCart();
  const { user } = useAuth();

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Books</h1>
        {isAdmin && <Link to="/admin/books/new" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add Book</Link>}
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text" placeholder="Search books..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 border rounded px-3 py-2"
        />
        <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} className="border rounded px-3 py-2">
          <option value="">All Categories</option>
          {categoriesData?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data?.data.map((book) => (
              <div key={book.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <Link to={`/books/${book.id}`}>
                  <h2 className="font-semibold text-lg mb-1 hover:text-blue-600">{book.title}</h2>
                </Link>
                <p className="text-gray-600 text-sm mb-1">{book.author}</p>
                <p className="text-xs text-gray-400 mb-2">{book.category?.name}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-700">${book.price.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">{book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}</span>
                </div>
                {user && book.stock > 0 && (
                  <button onClick={() => addItem(book)} className="mt-3 w-full bg-blue-600 text-white py-1.5 rounded text-sm hover:bg-blue-700">
                    Add to Cart
                  </button>
                )}
              </div>
            ))}
          </div>

          {data && data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.pagination.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
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
