import { pgTable, serial, varchar, boolean, integer, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  userId: serial('user_id').primaryKey(),
  username: varchar('username', { length: 255 }).unique().notNull(),
  hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
});

export const shops = pgTable('shops', {
  shopId: serial('shop_id').primaryKey(),
  adminId: integer('admin_id').references(() => users.userId).notNull(),
});

export const products = pgTable('products', {
  productId: serial('product_id').primaryKey(),
  shopId: integer('shop_id').references(() => shops.shopId).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});
