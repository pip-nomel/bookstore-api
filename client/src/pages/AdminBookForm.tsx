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

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{isEdit ? 'Edit' : 'Add'} Book</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Author</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ISBN</label>
          <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full border rounded px-3 py-2">
            <option value="">Select...</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">{isEdit ? 'Update' : 'Create'} Book</button>
      </form>
    </div>
  );
}
