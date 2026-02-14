export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  _count?: { books: number };
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  price: number;
  stock: number;
  categoryId: number;
  category?: Category;
  reviews?: Review[];
  createdAt: string;
}

export interface Review {
  id: number;
  userId: number;
  bookId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { id: number; name: string };
}

export interface OrderItem {
  id: number;
  bookId: number;
  quantity: number;
  price: number;
  book?: Book;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
  user?: { id: number; name: string; email: string };
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
