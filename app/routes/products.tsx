import { Form, useLoaderData, Link } from 'react-router';
import type { Route } from './+types/products';
import { db } from '~/db/db';
import { products } from '~/db/schema';
import { requireAuth } from '~/lib/auth.server';
import { eq } from 'drizzle-orm';
import { clearAuthCookie } from '~/lib/auth';
import { redirect } from 'react-router';

export async function loader({ request }: Route.LoaderArgs) {
  const user = requireAuth(request);

  // Fetch all products from the first shop
  const allProducts = await db.select().from(products);

  return { products: allProducts, user };
}

export async function action({ request }: Route.ActionArgs) {
  const user = requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get('intent');

  // Handle logout
  if (intent === 'logout') {
    return redirect('/login', {
      headers: {
        'Set-Cookie': clearAuthCookie(),
      },
    });
  }

  // Handle buy product
  if (intent === 'buy') {
    const productId = formData.get('productId');
    if (productId) {
      await db.delete(products).where(eq(products.productId, Number(productId)));
    }
  }

  return null;
}

export default function Products() {
  const { products: productList, user } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Artisan Marketplace
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{user.username}</span>
            </span>
            {user.isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
              >
                Admin Panel
              </Link>
            )}
            <Form method="post">
              <input type="hidden" name="intent" value="logout" />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
              >
                Logout
              </button>
            </Form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Available Products
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Browse our collection of handcrafted items
          </p>
        </div>

        {productList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productList.map((product) => (
              <div
                key={product.productId}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-2xl font-bold text-indigo-600 mb-4">
                    ${product.price}
                  </p>
                  <Form method="post" className="w-full">
                    <input type="hidden" name="intent" value="buy" />
                    <input
                      type="hidden"
                      name="productId"
                      value={product.productId}
                    />
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Buy Now
                    </button>
                  </Form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
