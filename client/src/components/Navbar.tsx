import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCartIcon, HeartIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
          📚 Bookstore
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/books" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
            Books
          </Link>
          {user ? (
            <>
              <Link to="/orders" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Orders
              </Link>
              <Link to="/wishlist" className="text-gray-300 hover:text-white transition-colors">
                <HeartIcon className="w-5 h-5" />
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                  Admin
                </Link>
              )}
              <Link to="/cart" className="text-gray-300 hover:text-white transition-colors relative">
                <ShoppingCartIcon className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">
                <UserCircleIcon className="w-5 h-5" />
              </Link>
              <span className="text-gray-500 text-sm">{user.name}</span>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                Login
              </Link>
              <Link to="/register" className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-500 transition-colors text-sm font-medium">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
