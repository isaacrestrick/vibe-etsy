import { Form, useLoaderData, useActionData, Link } from 'react-router';
import type { Route } from './+types/admin';
import { db } from '~/db/db';
import { products, shops } from '~/db/schema';
import { requireAdmin } from '~/lib/auth.server';
import { redirect } from 'react-router';
import { clearAuthCookie } from '~/lib/auth';

export async function loader({ request }: Route.LoaderArgs) {
  const user = requireAdmin(request);

  // Fetch all products and shops
  const [allProducts, allShops] = await Promise.all([
    db.select().from(products),
    db.select().from(shops),
  ]);

  return {
    products: allProducts,
    user,
    shopId: allShops[0]?.shopId || null,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const user = requireAdmin(request);
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

  // Handle add product
  if (intent === 'add-product') {
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;

    // Validate inputs
    if (!name || !price) {
      return { error: 'Product name and price are required' };
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return { error: 'Price must be a positive number' };
    }

    try {
      // Get the first shop (or create one if none exists)
      let [shop] = await db.select().from(shops).limit(1);

      if (!shop) {
        // Create a shop if none exists
        [shop] = await db.insert(shops).values({
          adminId: user.userId,
        }).returning();
      }

      // Insert product
      await db.insert(products).values({
        shopId: shop.shopId,
        name,
        price: priceNum.toFixed(2),
      });

      return { success: 'Product added successfully!' };
    } catch (error) {
      console.error('Add product error:', error);
      return { error: 'An error occurred while adding the product' };
    }
  }

  return null;
}

export default function Admin() {
  const { products: productList, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Panel
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{user.username}</span>
            </span>
            <Link
              to="/products"
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
            >
              View Storefront
            </Link>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Product Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add New Product
            </h2>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="add-product" />

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Product Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Handmade Ceramic Bowl"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price ($)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 29.99"
                />
              </div>

              {actionData?.error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{actionData.error}</p>
                </div>
              )}

              {actionData?.success && (
                <div className="rounded-md bg-green-50 p-4">
                  <p className="text-sm text-green-800">{actionData.success}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Product
              </button>
            </Form>
          </div>

          {/* Product List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Products ({productList.length})
            </h2>
            {productList.length === 0 ? (
              <p className="text-gray-500 text-sm">No products yet. Add your first product!</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {productList.map((product) => (
                  <div
                    key={product.productId}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-indigo-600 font-semibold">
                        ${product.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
