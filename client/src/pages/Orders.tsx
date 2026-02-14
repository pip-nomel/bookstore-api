import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Order } from '../lib/types';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SHIPPED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function OrderSkeleton() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-5 bg-gray-700 rounded w-28" />
        <div className="h-5 bg-gray-700 rounded w-20" />
      </div>
      <div className="h-4 bg-gray-700 rounded w-32 mb-2" />
      <div className="h-4 bg-gray-700 rounded w-40" />
    </div>
  );
}

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then((r) => r.data.data as Order[]),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">My Orders</h1>
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)}
        </div>
      ) : !data?.length ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {data.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}
              className="block bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-100">Order #{order.id}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[order.status] || 'bg-gray-700 text-gray-400'}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-gray-400 mt-1">
                {order.items.length} item(s) — <span className="font-bold text-emerald-400">${order.totalPrice.toFixed(2)}</span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
