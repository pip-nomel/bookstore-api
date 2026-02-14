import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../lib/types';

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', id] }),
  });

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;
  if (!order) return <p className="text-center mt-10">Order not found</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="text-blue-600 hover:underline mb-4 inline-block">← Back to orders</Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order #{order.id}</h1>
        <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
      </div>

      <div className="border rounded p-4 mb-6">
        <p className="mb-1"><strong>Status:</strong> {order.status}</p>
        {order.user && <p className="mb-1"><strong>Customer:</strong> {order.user.name} ({order.user.email})</p>}
        <p><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</p>

        {isAdmin && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <button key={s} onClick={() => updateStatus.mutate(s)} disabled={order.status === s}
                className={`px-3 py-1 rounded text-sm ${order.status === s ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">Items</h2>
      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <p className="font-semibold">{item.book?.title}</p>
              <p className="text-sm text-gray-500">{item.book?.author}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">{item.quantity} × ${item.price.toFixed(2)}</p>
              <p className="font-bold">${(item.quantity * item.price).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
