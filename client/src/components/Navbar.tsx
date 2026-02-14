import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">📚 Bookstore</Link>
        <div className="flex items-center gap-4">
          <Link to="/books" className="hover:text-blue-300">Books</Link>
          {user ? (
            <>
              <Link to="/orders" className="hover:text-blue-300">Orders</Link>
              {isAdmin && <Link to="/admin" className="hover:text-blue-300">Admin</Link>}
              <Link to="/cart" className="hover:text-blue-300 relative">
                🛒{count > 0 && <span className="absolute -top-2 -right-3 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">{count}</span>}
              </Link>
              <span className="text-gray-400 text-sm">{user.name}</span>
              <button onClick={() => { logout(); navigate('/login'); }} className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-300">Login</Link>
              <Link to="/register" className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-500">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
