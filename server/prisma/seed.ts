import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean up
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@bookstore.com', password: adminPassword, name: 'Admin User', role: 'ADMIN' },
  });

  const user = await prisma.user.create({
    data: { email: 'john@example.com', password: userPassword, name: 'John Doe', role: 'USER' },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Fiction', description: 'Novels, short stories, and literary fiction' } }),
    prisma.category.create({ data: { name: 'Science Fiction', description: 'Futuristic and speculative fiction' } }),
    prisma.category.create({ data: { name: 'Non-Fiction', description: 'Factual books, biographies, and essays' } }),
    prisma.category.create({ data: { name: 'Mystery', description: 'Detective stories and thrillers' } }),
    prisma.category.create({ data: { name: 'Programming', description: 'Software development and computer science' } }),
  ]);

  // Books
  const booksData = [
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', price: 14.99, stock: 25, categoryId: categories[0].id },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061120084', price: 12.99, stock: 30, categoryId: categories[0].id },
    { title: '1984', author: 'George Orwell', isbn: '978-0451524935', price: 11.99, stock: 40, categoryId: categories[0].id },
    { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-0141439518', price: 9.99, stock: 20, categoryId: categories[0].id },
    { title: 'Dune', author: 'Frank Herbert', isbn: '978-0441013593', price: 16.99, stock: 15, categoryId: categories[1].id },
    { title: 'Neuromancer', author: 'William Gibson', isbn: '978-0441569595', price: 13.99, stock: 18, categoryId: categories[1].id },
    { title: 'Foundation', author: 'Isaac Asimov', isbn: '978-0553293357', price: 15.99, stock: 22, categoryId: categories[1].id },
    { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '978-0441478125', price: 14.49, stock: 12, categoryId: categories[1].id },
    { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '978-0062316097', price: 18.99, stock: 35, categoryId: categories[2].id },
    { title: 'Educated', author: 'Tara Westover', isbn: '978-0399590504', price: 16.49, stock: 28, categoryId: categories[2].id },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '978-0374533557', price: 17.99, stock: 20, categoryId: categories[2].id },
    { title: 'The Body', author: 'Bill Bryson', isbn: '978-0385539302', price: 15.49, stock: 16, categoryId: categories[2].id },
    { title: 'Gone Girl', author: 'Gillian Flynn', isbn: '978-0307588371', price: 13.99, stock: 24, categoryId: categories[3].id },
    { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '978-0307454546', price: 14.99, stock: 19, categoryId: categories[3].id },
    { title: 'Big Little Lies', author: 'Liane Moriarty', isbn: '978-0399587191', price: 12.49, stock: 21, categoryId: categories[3].id },
    { title: 'In the Woods', author: 'Tana French', isbn: '978-0143113492', price: 13.49, stock: 17, categoryId: categories[3].id },
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', price: 39.99, stock: 10, categoryId: categories[4].id },
    { title: 'The Pragmatic Programmer', author: 'David Thomas', isbn: '978-0135957059', price: 44.99, stock: 8, categoryId: categories[4].id },
    { title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0201633610', price: 49.99, stock: 6, categoryId: categories[4].id },
    { title: 'Refactoring', author: 'Martin Fowler', isbn: '978-0134757599', price: 42.99, stock: 11, categoryId: categories[4].id },
  ];

  const books = await Promise.all(booksData.map(b => prisma.book.create({ data: b })));

  // Orders
  const order1 = await prisma.order.create({
    data: {
      userId: user.id,
      status: 'DELIVERED',
      totalPrice: 27.98,
      items: {
        create: [
          { bookId: books[0].id, quantity: 1, price: 14.99 },
          { bookId: books[4].id, quantity: 1, price: 16.99 },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: user.id,
      status: 'PENDING',
      totalPrice: 39.99,
      items: {
        create: [
          { bookId: books[16].id, quantity: 1, price: 39.99 },
        ],
      },
    },
  });

  // Reviews (only for books the user has ordered)
  await prisma.review.create({
    data: { userId: user.id, bookId: books[0].id, rating: 5, comment: 'An absolute classic. Fitzgerald at his finest.' },
  });

  await prisma.review.create({
    data: { userId: user.id, bookId: books[4].id, rating: 4, comment: 'Epic world-building. A must-read for sci-fi fans.' },
  });

  console.log('Seed data created successfully!');
  console.log(`Admin: admin@bookstore.com / admin123`);
  console.log(`User: john@example.com / user123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
