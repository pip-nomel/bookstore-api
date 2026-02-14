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

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>

      <div className="border rounded p-4 mb-8">
        <h2 className="font-semibold mb-3">Add Category</h2>
        <div className="flex gap-3">
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-3 py-2 flex-1" />
          <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border rounded px-3 py-2 flex-2" />
          <button onClick={() => addCategory.mutate()} disabled={!name || !description} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">Add</button>
        </div>
      </div>

      <div className="space-y-3">
        {categories?.map((c) => (
          <div key={c.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-gray-500">{c.description}</p>
            </div>
            <span className="text-sm text-gray-400">{c._count?.books || 0} books</span>
          </div>
        ))}
      </div>
    </div>
  );
}
