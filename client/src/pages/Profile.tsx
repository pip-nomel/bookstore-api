import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../lib/api';
import { User } from '../lib/types';
import toast from 'react-hot-toast';

export default function Profile() {
  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name, email, currentPassword });
      toast.success('Profile updated');
      setCurrentPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Profile</h1>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <p className="text-sm text-gray-400">Member since</p>
        <p className="text-gray-100">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</p>
        <p className="text-sm text-gray-400 mt-3">Role</p>
        <p className="text-gray-100 capitalize">{profile?.role}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
