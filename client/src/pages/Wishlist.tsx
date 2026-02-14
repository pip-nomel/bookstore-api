import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlist, removeFromWishlist } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import { WishlistItem } from '../lib/types';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const queryClient = useQueryClient();
  const { addItem } = useCart();

  const { data: items, isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
  });

  const removeMutation = useMutation({
    mutationFn: (bookId: number) => removeFromWishlist(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
    onError: () => toast.error('Failed to remove from wishlist'),
  });

  if (isLoading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">My Wishlist</h1>

      {!items?.length ? (
        <p className="text-gray-400 text-center py-12">Your wishlist is empty.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-lg p-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-100">{item.book.title}</h2>
                <p className="text-sm text-gray-400">{item.book.author}</p>
                <p className="text-emerald-400 font-medium mt-1">${item.book.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    addItem(item.book);
                    toast.success('Added to cart');
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors text-sm"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => removeMutation.mutate(item.bookId)}
                  className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
