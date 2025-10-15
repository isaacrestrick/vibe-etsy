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
  const totalInventoryValue = productList.reduce((acc, product) => acc + Number(product.price ?? 0), 0);
  const stats = [
    {
      label: 'Active Orders',
      value: productList.length,
      icon: '📜',
      caption: 'Scrolls on the dispatch board',
    },
    {
      label: 'Cellar Ledger',
      value: `$${totalInventoryValue.toFixed(2)}`,
      icon: '💰',
      caption: 'Feasts awaiting payment',
    },
    {
      label: 'Guildmaster',
      value: user.username,
      icon: '⚔️',
      caption: 'Keeper of the roster',
    },
  ] as const;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-stone-950 via-emerald-950 to-amber-900 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-10 h-80 w-80 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="absolute bottom-[-10%] left-1/3 h-72 w-72 rounded-full bg-lime-500/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
              Guild Command Post
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              BoarDash Dispatch Hall
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <span className="text-lg">🐗</span>
              View Orders
            </Link>
            <Form method="post">
              <input type="hidden" name="intent" value="logout" />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <span>Logout</span>
                <span className="text-lg">↗</span>
              </button>
            </Form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto mt-10 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <section className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_-45px_rgba(8,47,73,0.6)]"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
              <div className="text-3xl">{stat.icon}</div>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/60">
                {stat.caption}
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{stat.value}</h2>
              <p className="mt-2 text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </section>

        <div className="mt-12 grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          {/* Add Product Form */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-45px_rgba(8,47,73,0.6)]">
            <div className="absolute -left-10 top-12 h-48 w-48 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-amber-500/25 blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                🐗 Forge a new order
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-white">
                Post a Royal Banquet
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Record a new meal for riders to ferry across the realm.
              </p>
              <Form method="post" className="mt-8 space-y-6">
                <input type="hidden" name="intent" value="add-product" />

                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold uppercase tracking-[0.3em] text-white/60"
                  >
                    Product name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-2 block w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/40"
                    placeholder="e.g., Emberbraised Boar Haunch"
                  />
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="block text-xs font-semibold uppercase tracking-[0.3em] text-white/60"
                  >
                    Price (USD)
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="mt-2 block w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/40"
                    placeholder="e.g., 42.00"
                  />
                </div>

                {actionData?.error && (
                  <div className="rounded-2xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    ❌ {actionData.error}
                  </div>
                )}

                {actionData?.success && (
                  <div className="rounded-2xl border border-green-300/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    ✅ {actionData.success}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_25px_70px_-35px_rgba(8,47,73,0.65)] transition hover:shadow-[0_30px_80px_-40px_rgba(245,158,11,0.65)]"
                >
                  <span className="text-lg">🕯️</span>
                  Post to dispatch board
                </button>
              </Form>
            </div>
          </div>

          {/* Product List */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-45px_rgba(8,47,73,0.55)]">
            <div className="absolute inset-x-6 top-6 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/50">
              <span>Dispatch ledger</span>
              <span>{productList.length} entries</span>
            </div>
            <div className="mt-12 space-y-6">
              {productList.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center text-sm text-white/60">
                  The board is bare. Post a banquet and summon the riders.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {productList.map((product) => (
                    <div
                      key={product.productId}
                      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-5 transition hover:border-white/30"
                    >
                      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
                      <p className="text-sm font-semibold text-white">
                        {product.name}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-transparent bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-200 bg-clip-text">
                        ${product.price}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/40">
                        Order #{product.productId}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
