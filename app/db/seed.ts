import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [admin] = await db
      .insert(schema.users)
      .values({
        username: 'admin',
        hashedPassword,
        isAdmin: true,
      })
      .returning();
    console.log('✓ Admin user created:', admin.username);

    // Create a regular customer user for testing
    console.log('Creating customer user...');
    const customerPassword = await bcrypt.hash('customer123', 10);
    const [customer] = await db
      .insert(schema.users)
      .values({
        username: 'customer',
        hashedPassword: customerPassword,
        isAdmin: false,
      })
      .returning();
    console.log('✓ Customer user created:', customer.username);

    // Create shop
    console.log('Creating shop...');
    const [shop] = await db
      .insert(schema.shops)
      .values({
        adminId: admin.userId,
      })
      .returning();
    console.log('✓ Shop created with ID:', shop.shopId);

    // Create sample products
    console.log('Creating sample products...');
    const sampleProducts = [
      { name: 'Handmade Ceramic Mug', price: '24.99' },
      { name: 'Leather Journal', price: '34.50' },
      { name: 'Scented Candle Set', price: '18.00' },
      { name: 'Wooden Cutting Board', price: '42.00' },
      { name: 'Knitted Wool Scarf', price: '28.75' },
      { name: 'Artisan Soap Collection', price: '15.99' },
      { name: 'Hand-painted Greeting Cards', price: '12.50' },
      { name: 'Macrame Plant Hanger', price: '22.00' },
    ];

    for (const product of sampleProducts) {
      await db.insert(schema.products).values({
        shopId: shop.shopId,
        name: product.name,
        price: product.price,
      });
    }
    console.log('✓ Created', sampleProducts.length, 'sample products');

    console.log('✅ Seeding complete!');
    console.log('\nTest credentials:');
    console.log('Admin - username: admin, password: admin123');
    console.log('Customer - username: customer, password: customer123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed();
