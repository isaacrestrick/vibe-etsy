# Vibe Etsy - Artisan Marketplace

A minimal Etsy-style e-commerce application built with React Router v7, Drizzle ORM, and Supabase.

## Features

- User authentication (signup/login) with JWT tokens
- Customer storefront for browsing products
- One-click product purchasing (removes from inventory)
- Admin panel for adding new products
- Secure session management with httpOnly cookies
- Type-safe database queries with Drizzle ORM
- Beautiful, responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: React Router v7 (Framework Mode)
- **Backend**: React Router v7 server-side actions/loaders
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: JWT with bcryptjs
- **Styling**: Tailwind CSS
- **Runtime**: Bun
- **Language**: TypeScript

## Project Structure

```
app/
├── db/
│   ├── schema.ts        # Database schema definitions
│   ├── db.ts            # Database connection
│   └── seed.ts          # Seed script for initial data
├── lib/
│   ├── auth.ts          # JWT and password utilities
│   └── auth.server.ts   # Server-side auth middleware
├── routes/
│   ├── _index.tsx       # Root route (redirects based on auth)
│   ├── login.tsx        # Login page
│   ├── signup.tsx       # Signup page
│   ├── products.tsx     # Customer storefront
│   └── admin.tsx        # Admin panel
└── root.tsx             # Root layout and error boundary
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- A [Supabase](https://supabase.com) account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vibe-etsy
```

2. Install dependencies:
```bash
bun install
```

3. Set up your Supabase project:
   - Create a new project on [Supabase](https://supabase.com)
   - Get your connection string from Settings > Database
   - Use the "Transaction" pooling mode connection string

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-secure-random-secret-here
```

5. Push the database schema:
```bash
bun run db:push
```

6. Seed the database with initial data:
```bash
bun run db:seed
```

This creates sample products for the marketplace.

### Development

Start the development server:
```bash
bun run dev
```

Visit `http://localhost:5173` to see the application.

### Building for Production

Build the application:
```bash
bun run build
```

Start the production server:
```bash
bun start
```

### Type Checking

Run TypeScript type checking:
```bash
bun run typecheck
```

## User Flows

### Customer Flow
1. **Sign up** at `/signup` or **log in** at `/login`
2. Browse products at `/products`
3. Click "Buy Now" to purchase a product (removes it from inventory)
4. Log out when done

### Admin Flow
1. **Log in** at `/login` with admin credentials
2. Redirected to admin panel at `/admin`
3. View all current products
4. Add new products with name and price
5. Switch to storefront to see customer view
6. Log out when done

## Database Schema

### Users Table
- `user_id` (serial, PK)
- `username` (varchar, unique)
- `hashed_password` (varchar)
- `is_admin` (boolean)

### Shops Table
- `shop_id` (serial, PK)
- `admin_id` (integer, FK to users)

### Products Table
- `product_id` (serial, PK)
- `shop_id` (integer, FK to shops)
- `name` (varchar)
- `price` (decimal)

## Security Features

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens stored in httpOnly cookies (not localStorage)
- Server-side authentication checks on all protected routes
- Admin-only routes protected with role-based access control
- SQL injection prevention via Drizzle ORM parameterized queries

## Architecture Decisions

- **Single-shop system**: Simplified V1 uses the first shop in the database
- **Server-side rendering**: React Router v7 loaders fetch data on the server
- **Form-based mutations**: Using React Router actions for type-safe mutations
- **Normalized database**: Products reference shops (not denormalized arrays)
- **JWT in cookies**: More secure than localStorage, prevents XSS attacks

## Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun start` - Start production server
- `bun run typecheck` - Run TypeScript type checking
- `bun run db:push` - Push database schema to Supabase
- `bun run db:seed` - Seed database with initial data

## License

MIT
