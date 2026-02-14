import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function Admin() {
  const { data: books } = useQuery({
    queryKey: ['books-admin'],
    queryFn: () => api.get('/books', { params: { limit: 1000 } }).then((r) => r.data),
  });
  const { data: orders } = useQuery({
    queryKey: ['orders-admin'],
    queryFn: () => api.get('/orders').then((r) => r.data),
  });
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data),
  });

  const totalBooks = books?.pagination?.total || 0;
  const totalOrders = orders?.pagination?.total || orders?.data?.length || 0;
  const revenue = orders?.data?.reduce((s: number, o: any) => s + o.totalPrice, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-blue-400">{totalBooks}</p>
          <p className="text-gray-400">Books</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-emerald-400">{totalOrders}</p>
          <p className="text-gray-400">Orders</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-purple-400">{categories?.length || 0}</p>
          <p className="text-gray-400">Categories</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-yellow-400">${revenue.toFixed(2)}</p>
          <p className="text-gray-400">Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/books" className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
          <p className="text-xl font-semibold text-gray-100">📚 Manage Books</p>
        </Link>
        <Link to="/orders" className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
          <p className="text-xl font-semibold text-gray-100">📦 Manage Orders</p>
        </Link>
        <Link to="/admin/categories" className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
          <p className="text-xl font-semibold text-gray-100">🏷️ Manage Categories</p>
        </Link>
      </div>
    </div>
  );
}
