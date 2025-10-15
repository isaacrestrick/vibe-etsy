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
  const highlightCards = [
    {
      icon: '🛡️',
      title: 'Guild-Vetted Couriers',
      description: 'Sworn messengers who brave bandits and wyrms to reach the keep before the feast grows cold.',
    },
    {
      icon: '🍖',
      title: 'Feasts on the Run',
      description: 'Roasted boar, charred root pies, and steaming flagons packed to survive the roughest quests.',
    },
    {
      icon: '🔮',
      title: 'Arcane Tracking',
      description: 'Crystal lanterns glimmer on the map so you always know where your courier vanished to.',
    },
  ] as const;

  const collectionSpotlights = [
    {
      label: 'Royal Banquet',
      description: 'Honeyed ribs, emberbread loaves, and goblets fit for the Queen of Emberfell.',
      accent: 'feasts for nobles',
      gradient: 'from-amber-600/80 via-amber-500/70 to-rose-500/70',
    },
    {
      label: 'Outrider Rations',
      description: 'Trail stews, smoked jerky, and enchanted waterskins for riders who never dismount.',
      accent: 'provisions for riders',
      gradient: 'from-teal-600/80 via-emerald-600/70 to-slate-500/70',
    },
    {
      label: 'Arcane Pantry',
      description: 'Moonlit pastries, mana broths, and glyph-infused desserts for the guild of mages.',
      accent: 'enchanted delicacies',
      gradient: 'from-indigo-600/80 via-violet-600/70 to-fuchsia-500/70',
    },
  ] as const;

  const microCopy = [
    'Quest reward delivery',
    'Fresh from the royal kitchens',
    'Sealed with warding sigils',
    'Rushed by griffin courier',
  ] as const;

  const fallbackNames = [
    'Emberbraised Boar Haunch',
    'Moonlit Mead Cask',
    'Stonefire Root Stew',
    'Dragonchaser Trail Mix',
    'Gilded Griffon Pastries',
    'Stormforged Brine Bread',
  ] as const;

  const flavorNotes = [
    'Roasted overnight in dragonbone ovens and wrapped in emberleaf.',
    'Brewed under a blood moon and sealed with silver wax.',
    'Hearty tubers simmered with smoked venison for roadside feasts.',
    'Peppered nuts and dried berries favored by outriders.',
    'Puff pastry stacked with cloudberry jam and sugared petals.',
    'Sea salt loaves baked inside rune-carved hearthstones.',
  ] as const;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-stone-950 via-emerald-950 to-amber-950 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-10 h-96 w-96 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="absolute top-64 -right-20 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-600/20 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-white/5 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-emerald-600 text-2xl shadow-lg shadow-amber-500/40">
                🐗
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">
                  BoarDash Marketplace
                </h1>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-200">
                  Medieval delivery guild of the realm
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-purple-500/30 backdrop-blur">
                <span className="text-base">👋</span>
                <span className="text-white/80">{user.username}</span>
              </div>
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/40 transition-all hover:shadow-xl"
                >
                  <span>⚙️</span>
                  <span>Studio Admin</span>
                  <span className="text-white/80 transition group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              )}
              <Form method="post">
                <input type="hidden" name="intent" value="logout" />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 shadow-sm transition hover:border-white/20 hover:bg-white/10"
                >
                  <span>Bye for now</span>
                  <span className="text-base">👋</span>
                </button>
              </Form>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-800 via-teal-800 to-amber-700" />
          <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(circle_at_top,_white,_transparent_65%)]" />
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 md:py-20 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.35em] text-white/90">
                <span className="text-base">⚔️</span> Deliveries for the realm
              </span>
              <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Feast Faster with BoarDash
              </h2>
              <p className="mt-5 text-lg text-white/85 sm:text-xl">
                Summon a guild courier, have the castle kitchens roast your boar, and track the rider through storm and
                shadow until supper lands at your gate.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-white/85">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
                  <span className="text-lg">🐎</span>
                  Riders sworn to the High Table
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
                  <span className="text-lg">🗡️</span>
                  Hazard pay for dragon alleys
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
                  <span className="text-lg">🍯</span>
                  Hearth-to-hall in under an hourglass
                </span>
              </div>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-3">
              {highlightCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-white/20 bg-white/10 p-6 text-left text-white backdrop-blur-xl shadow-[0_25px_60px_-25px_rgba(15,11,44,0.25)]"
                >
                  <div className="text-3xl">{card.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
                  <p className="mt-2 text-sm text-white/80">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Collections */}
        <section className="relative z-10 mx-auto mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {collectionSpotlights.map((collection) => (
              <div
                key={collection.label}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-40px_rgba(8,47,73,0.55)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_-40px_rgba(21,128,61,0.6)]"
              >
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${collection.gradient} opacity-70 transition-opacity duration-300 group-hover:opacity-90`}
                />
                <div className="absolute inset-0 -z-[5] bg-white/10 backdrop-blur-xl" />
                <div className="flex h-full flex-col text-white">
                  <div className="text-xs uppercase tracking-[0.4em] text-white/70">
                    {collection.accent}
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold">{collection.label}</h3>
                  <p className="mt-4 text-sm text-white/85">
                    {collection.description}
                  </p>
                  <div className="mt-auto pt-6 text-sm font-semibold">
                    Explore now →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Content */}
        <main className="relative z-10 mx-auto mt-16 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-semibold sm:text-4xl">
              Provisions Ready for Dispatch
            </h3>
            <div className="mx-auto mt-4 flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/10 px-6 py-2 text-sm font-medium text-amber-200 shadow-sm shadow-emerald-500/30 backdrop-blur">
              <span className="text-lg">📜</span>
              {productList.length} open {productList.length === 1 ? 'order' : 'orders'} awaiting their courier
            </div>
          </div>

          {productList.length === 0 ? (
            <div className="mt-16 rounded-3xl border border-dashed border-white/20 bg-white/5 p-16 text-center text-white/70 shadow-[0_20px_60px_-40px_rgba(8,47,73,0.45)]">
              <div className="text-6xl">🕯️</div>
              <h4 className="mt-6 text-2xl font-semibold text-white">
                The kitchens cool for now
              </h4>
              <p className="mt-3 text-sm text-white/60">
                Return at next bell for fresh contracts and steaming platters.
              </p>
            </div>
          ) : (
            <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {productList.map((product, index) => {
                const displayName =
                  /boar|stew|mead|griff|dragon|feast|banquet|stew/i.test(product.name ?? '')
                    ? product.name
                    : fallbackNames[index % fallbackNames.length];
                const flavorLine = flavorNotes[index % flavorNotes.length];

                return (
                  <div
                    key={product.productId}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_25px_60px_-40px_rgba(8,47,73,0.55)] transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_30px_80px_-45px_rgba(8,47,73,0.65)]"
                  >
                  <div className="absolute inset-x-6 top-6 z-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                    {microCopy[index % microCopy.length]}
                  </div>
                  <div className="relative isolate overflow-hidden rounded-2xl px-8 pt-16 pb-6">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/30 via-teal-500/30 to-amber-400/30 transition-opacity duration-300 group-hover:opacity-90" />
                    <div className="absolute -left-10 top-1/2 -z-10 h-32 w-32 -translate-y-1/2 rounded-full bg-white/10 blur-2xl" />
                    <div className="flex min-h-[9rem] items-center justify-center text-7xl text-white/70 transition-transform duration-300 group-hover:scale-110">
                      🐗
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col px-8 pb-8 pt-6">
                    <h4 className="text-xl font-semibold text-white transition-colors group-hover:text-fuchsia-200">
                      {displayName}
                    </h4>
                    <p className="mt-2 text-sm italic text-white/60">
                      {flavorLine}
                    </p>
                    <div className="mt-4 flex items-baseline gap-2">
                      <p className="text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-300 bg-clip-text">
                        ${product.price}
                      </p>
                      <span className="text-sm font-medium text-white/50">USD</span>
                    </div>
                    <p className="mt-3 text-sm text-white/60">
                      Courier departs in {2 + (index % 3)} hourglass {index % 3 === 1 ? 'turns' : 'turns'} • Comes sealed with a guild crest
                    </p>

                    <Form method="post" className="mt-8">
                      <input type="hidden" name="intent" value="buy" />
                      <input type="hidden" name="productId" value={product.productId} />
                      <button
                        type="submit"
                        className="group/button flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/40 transition-all hover:shadow-xl"
                      >
                        <span className="text-lg">🛎️</span>
                        <span>Summon a courier</span>
                        <span className="transition-transform group-hover/button:translate-x-1">
                          →
                        </span>
                      </button>
                    </Form>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Closing CTA */}
        <section className="relative z-10 border-t border-white/10 bg-white/5">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-[1.2fr_1fr] sm:px-6 lg:px-8">
            <div>
              <h4 className="text-3xl font-semibold text-white">
                Join the Courier’s Tally
              </h4>
              <p className="mt-3 text-sm text-white/70">
                Receive herald updates on fresh contracts, rare banquets, and griffin-ready routes.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  type="button"
                  className="rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/40 transition hover:shadow-xl"
                >
                  Notify me
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-[0_20px_60px_-45px_rgba(123,31,162,0.55)] backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">
                Tavern gossip
              </p>
              <p className="mt-4 text-lg font-medium text-white">
                “My BoarDash courier outran a wyvern squadron to deliver a cauldron of stew still bubbling. I knighted
                him on the spot.”
              </p>
              <div className="mt-6 text-sm text-white/70">
                — Lady Sera, Keeper of the Sapphire Gate
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-white/5 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-white/70 sm:flex-row sm:px-6 lg:px-8">
            <p className="text-white/70">Forged by the BoarDash Guild of Deliveries</p>
            <div className="flex items-center gap-4 text-white/60">
              <span className="flex items-center gap-1">
                <span className="text-lg">🛡️</span> Couriers warded against misfortune
              </span>
              <span className="flex items-center gap-1">
                <span className="text-lg">🔥</span> Hearth-to-hall in record time
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
