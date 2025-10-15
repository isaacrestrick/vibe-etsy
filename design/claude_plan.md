# Vibe-Etsy Implementation Plan

## Tech Stack
- **Bun** - Fast JavaScript runtime & package manager
- **React Router v7** (Framework Mode) - Full-stack framework with loaders/actions
- **Drizzle ORM** - Type-safe database queries
- **Supabase** - PostgreSQL hosting
- **TypeScript** - Type safety throughout

---

## Phase 1: Project Setup & Database Schema

### 1. Initialize React Router Framework Mode project
- Run: `bunx create-react-router@latest app`
- Set up TypeScript configuration

### 2. Install Drizzle ORM dependencies
- Install: `bun add drizzle-orm postgres dotenv`
- Install dev: `bun add -d drizzle-kit`

### 3. Create Supabase project & get connection string
- Set up `.env` with `DATABASE_URL` (Supabase connection pooling URL)

### 4. Define Drizzle schema (`src/db/schema.ts`)
- `users` table: `user_id` (PK), `username`, `hashed_password`, `is_admin`
- `shops` table: `shop_id` (PK), `admin_id` (FK to users)
- `products` table: `product_id` (PK), `shop_id` (FK to shops), `name`, `price`
- **Note**: Fix design's denormalized approach - put `shop_id` in products, not `product_ids[]` in shops

### 5. Configure Drizzle (`drizzle.config.ts`)
- Set dialect to 'postgresql'
- Configure migrations directory
- Push schema: `bunx drizzle-kit push`

### 6. Seed initial data
- Create admin user with hashed password (use bcrypt)
- Create initial shop
- Add sample products

---

## Phase 2: Authentication System

### 7. Install auth dependencies
- Install: `bun add bcryptjs jsonwebtoken`
- Install types: `bun add -d @types/bcryptjs @types/jsonwebtoken`

### 8. Create auth utilities (`src/lib/auth.ts`)
- JWT generation/verification functions
- Password hashing/comparison helpers
- Auth session management

### 9. Implement auth routes
- `routes/signup.tsx` - POST action to create user, return JWT
- `routes/login.tsx` - POST action to verify credentials, return JWT
- Both with form UI and error handling

### 10. Create auth middleware
- Loader helper to verify JWT from cookies/headers
- Extract user data for protected routes
- Redirect to login if unauthorized

---

## Phase 3: Product Browsing (Customer Flow)

### 11. Create storefront route (`routes/products.$shopId.tsx`)
- **Loader**: Fetch all products for shop using Drizzle
- **Component**: Display products grid (name, price)
- Require authentication via loader

### 12. Implement "Buy" functionality
- **Action** on product route: DELETE product by ID
- Remove from database using Drizzle
- Return success/error response
- Update UI optimistically or revalidate

---

## Phase 4: Admin Panel

### 13. Create admin product form (`routes/admin.add-product.tsx`)
- **Component**: Form with name & price inputs
- **Action**: POST to create product
  - Verify user is admin (check JWT + `is_admin` flag)
  - Insert product into DB with Drizzle
  - Associate with shop
- Error handling for unauthorized access

### 14. Admin route protection
- Loader checks `is_admin` flag from JWT
- Redirect non-admins to storefront

---

## Phase 5: Integration & Polish

### 15. Set up session management
- Store JWT in httpOnly cookies (more secure than localStorage)
- Configure cookie parsing in React Router

### 16. Add logout functionality
- Clear JWT cookie
- Redirect to login

### 17. Error boundaries
- Add error handling for failed loaders/actions
- Display user-friendly error messages

### 18. Test all user flows
- Sign up → Login → Browse products → Buy product
- Admin login → Add product → Verify on storefront
- Logout flows

---

## Phase 6: Finalize & GitHub PR

### 19. Create feature branch
- Branch from main: `git checkout -b feat/initial-implementation`

### 20. Commit all changes
- Commit with descriptive messages
- Follow conventional commit format

### 21. Push to GitHub & create PR
- Push branch to remote
- Create PR with description of implementation
- Reference design documents

---

## Key Architectural Decisions

- **Single-shop system**: Hardcode shop ID or use first shop in DB (simplify V1)
- **Password hashing**: Server-side only (in actions, never client-side)
- **JWT storage**: httpOnly cookies (not localStorage for security)
- **Schema fix**: `shop_id` FK in products table (normalized SQL design)
- **Data fetching**: React Router loaders (not useEffect + fetch)
- **Mutations**: React Router actions with Form component
- **Package manager**: Bun for faster installs and runtime

---

## API Endpoints (via React Router Actions/Loaders)

### Authentication
- `POST /signup` - Create user account, return JWT
- `POST /login` - Verify credentials, return JWT
- `POST /logout` - Clear JWT cookie

### Products
- `GET /products/:shopId` - Fetch all products for shop (loader)
- `DELETE /product/:id` - Buy/delete product (action)

### Admin
- `POST /admin/product` - Add new product (action, admin-only)

---

## Database Schema (Drizzle)

```typescript
// users table
{
  user_id: serial().primaryKey(),
  username: varchar(255).unique().notNull(),
  hashed_password: varchar(255).notNull(),
  is_admin: boolean().default(false)
}

// shops table
{
  shop_id: serial().primaryKey(),
  admin_id: integer().references(() => users.user_id)
}

// products table
{
  product_id: serial().primaryKey(),
  shop_id: integer().references(() => shops.shop_id),
  name: varchar(255).notNull(),
  price: decimal(10, 2).notNull()
}
```

---

## Deliverable

A GitHub Pull Request containing:
- Working React Router v7 application
- Drizzle ORM integration with Supabase
- JWT authentication system
- Customer storefront with buy functionality
- Admin panel for adding products
- All code in TypeScript
- Ready for review and deployment
