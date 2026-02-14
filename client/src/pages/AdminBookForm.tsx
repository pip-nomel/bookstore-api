import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Category } from '../lib/types';

export default function AdminBookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data as Category[]),
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/books/${id}`).then((r) => {
        const b = r.data.data;
        setTitle(b.title);
        setAuthor(b.author);
        setIsbn(b.isbn);
        setPrice(String(b.price));
        setStock(String(b.stock));
        setCategoryId(String(b.categoryId));
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const data = { title, author, isbn, price: parseFloat(price), stock: parseInt(stock), categoryId: parseInt(categoryId) };
    try {
      if (isEdit) {
        await api.put(`/books/${id}`, data);
      } else {
        await api.post('/books', data);
      }
      navigate('/books');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save book');
    }
  };

  const inputClass = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-emerald-500";

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-6">{isEdit ? 'Edit' : 'Add'} Book</h1>
      {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Author</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">ISBN</label>
          <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} required className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className={inputClass}>
            <option value="">Select...</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-500 transition-colors">{isEdit ? 'Update' : 'Create'} Book</button>
      </form>
    </div>
  );
}
