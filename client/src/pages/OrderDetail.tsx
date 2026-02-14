import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../lib/types';
import toast from 'react-hot-toast';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SHIPPED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-24 mb-6" />
      <div className="h-8 bg-gray-700 rounded w-48 mb-6" />
      <div className="bg-gray-800 rounded-xl p-6 mb-6 space-y-3">
        <div className="h-4 bg-gray-700 rounded w-32" />
        <div className="h-4 bg-gray-700 rounded w-48" />
        <div className="h-4 bg-gray-700 rounded w-24" />
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data.data as Order),
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast.success('Status updated');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  if (isLoading) return <DetailSkeleton />;
  if (!order) return <p className="text-center mt-10 text-gray-400">Order not found</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="text-emerald-400 hover:text-emerald-300 transition-colors mb-6 inline-block text-sm">
        ← Back to orders
      </Link>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Order #{order.id}</h1>
        <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-gray-400 text-sm">Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[order.status] || 'bg-gray-700 text-gray-400'}`}>
            {order.status}
          </span>
        </div>
        {order.user && <p className="text-gray-400 text-sm mb-1">Customer: <span className="text-gray-200">{order.user.name}</span> ({order.user.email})</p>}
        <p className="text-gray-400 text-sm">Total: <span className="text-emerald-400 font-bold text-lg">${order.totalPrice.toFixed(2)}</span></p>

        {isAdmin && (
          <div className="mt-5 flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <button key={s} onClick={() => updateStatus.mutate(s)} disabled={order.status === s}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  order.status === s
                    ? `border ${statusStyles[s]}`
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200'
                }`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-100 mb-4">Items</h2>
      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-100">{item.book?.title}</p>
              <p className="text-sm text-gray-400">{item.book?.author}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">{item.quantity} × ${item.price.toFixed(2)}</p>
              <p className="font-bold text-gray-100">${(item.quantity * item.price).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
