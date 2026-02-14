import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Category } from '../lib/types';

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data as Category[]),
  });

  const addCategory = useMutation({
    mutationFn: () => api.post('/categories', { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName('');
      setDescription('');
    },
  });

  if (isLoading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-6">Manage Categories</h1>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-8">
        <h2 className="font-semibold text-gray-100 mb-3">Add Category</h2>
        <div className="flex gap-3">
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 flex-1 focus:outline-none focus:border-emerald-500" />
          <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 flex-[2] focus:outline-none focus:border-emerald-500" />
          <button onClick={() => addCategory.mutate()} disabled={!name || !description} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition-colors">Add</button>
        </div>
      </div>

      <div className="space-y-3">
        {categories?.map((c) => (
          <div key={c.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-100">{c.name}</p>
              <p className="text-sm text-gray-400">{c.description}</p>
            </div>
            <span className="text-sm text-gray-500">{c._count?.books || 0} books</span>
          </div>
        ))}
      </div>
    </div>
  );
}
