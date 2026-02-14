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
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-blue-700">{totalBooks}</p>
          <p className="text-gray-600">Books</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-green-700">{totalOrders}</p>
          <p className="text-gray-600">Orders</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-purple-700">{categories?.length || 0}</p>
          <p className="text-gray-600">Categories</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-6 text-center">
          <p className="text-3xl font-bold text-yellow-700">${revenue.toFixed(2)}</p>
          <p className="text-gray-600">Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/books" className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
          <p className="text-xl font-semibold">📚 Manage Books</p>
        </Link>
        <Link to="/orders" className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
          <p className="text-xl font-semibold">📦 Manage Orders</p>
        </Link>
        <Link to="/admin/categories" className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
          <p className="text-xl font-semibold">🏷️ Manage Categories</p>
        </Link>
      </div>
    </div>
  );
}
