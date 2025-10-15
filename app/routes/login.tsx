import { Form, redirect, useActionData, useLoaderData } from 'react-router';
import type { Route } from './+types/login';
import { db } from '~/db/db';
import { users } from '~/db/schema';
import { comparePassword, generateToken, createAuthCookie } from '~/lib/auth';
import { getAuthenticatedUser } from '~/lib/auth.server';
import { eq } from 'drizzle-orm';
import { getDemoAccounts } from '~/lib/env.server';

export async function loader({ request }: Route.LoaderArgs) {
  // Redirect to products if already logged in
  const user = getAuthenticatedUser(request);
  if (user) {
    throw redirect('/products');
  }
  return { demoAccounts: getDemoAccounts() };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  // Validate inputs
  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  try {
    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return { error: 'Invalid username or password' };
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.hashedPassword);
    if (!isValidPassword) {
      return { error: 'Invalid username or password' };
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.userId,
      username: user.username,
      isAdmin: user.isAdmin,
    });

    // Redirect based on user role
    const redirectPath = user.isAdmin ? '/admin' : '/products';

    return redirect(redirectPath, {
      headers: {
        'Set-Cookie': createAuthCookie(token),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An error occurred during login' };
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const { demoAccounts } = useLoaderData<typeof loader>();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-stone-950 via-emerald-950 to-amber-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 left-6 h-64 w-64 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-72 w-72 -translate-y-1/2 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="absolute bottom-[-10%] left-1/3 h-64 w-64 rounded-full bg-lime-500/20 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-400 text-4xl shadow-[0_20px_60px_-30px_rgba(8,47,73,0.75)]">
            🐗
          </div>
          <h2 className="mt-6 text-4xl font-semibold text-white">Return to the BoarDash Guild</h2>
          <p className="mt-2 text-sm text-white/70">
            Sign in to dispatch riders, track contracts, and keep the feasts flowing.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-45px_rgba(76,29,149,0.65)] backdrop-blur-xl">
          <Form method="post" className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-white/60"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="block w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/40"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-white/60"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/40"
                placeholder="Enter your password"
              />
            </div>

            {actionData?.error && (
              <div className="rounded-2xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                ❌ {actionData.error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 py-3.5 text-sm font-semibold text-white shadow-[0_25px_70px_-35px_rgba(8,47,73,0.65)] transition hover:shadow-[0_30px_80px_-40px_rgba(245,158,11,0.65)]"
            >
              Enter the hall ⚔️
            </button>
          </Form>

          <div className="mt-6 text-center text-sm text-white/70">
            <span>Don't have an account? </span>
            <a href="/signup" className="font-semibold text-amber-200 transition hover:text-lime-200">
              Swear the courier oath →
            </a>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 text-center">
          <div className="inline-block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70 backdrop-blur">
            <p className="mb-1 font-semibold text-white">Demo Accounts:</p>
            {demoAccounts.admin ? (
              <p>
                🛡️ {demoAccounts.admin.username} / {demoAccounts.admin.password} (Guildmaster)
              </p>
            ) : (
              <p className="text-white/50">
                Set <code className="font-mono">DEMO_ADMIN_USERNAME</code> & <code className="font-mono">DEMO_ADMIN_PASSWORD</code> in your
                <code className="font-mono">.env</code> to surface the admin login here.
              </p>
            )}
            {demoAccounts.customer ? (
              <p>
                🐴 {demoAccounts.customer.username} / {demoAccounts.customer.password} (Patron)
              </p>
            ) : (
              <p className="mt-1 text-white/50">
                Add <code className="font-mono">DEMO_CUSTOMER_USERNAME</code> & <code className="font-mono">DEMO_CUSTOMER_PASSWORD</code> to share a customer login.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
