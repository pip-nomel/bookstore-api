import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { booksRouter } from './routes/books';
import { categoriesRouter } from './routes/categories';
import { ordersRouter } from './routes/orders';
import { reviewsRouter } from './routes/reviews';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3456;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Bookstore API running on http://localhost:${PORT}`);
});

export default app;
