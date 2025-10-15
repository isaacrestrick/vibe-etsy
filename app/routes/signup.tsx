import { Form, redirect, useActionData } from 'react-router';
import type { Route } from './+types/signup';
import { db } from '~/db/db';
import { users } from '~/db/schema';
import { hashPassword, generateToken, createAuthCookie } from '~/lib/auth';
import { getAuthenticatedUser } from '~/lib/auth.server';
import { eq } from 'drizzle-orm';

export async function loader({ request }: Route.LoaderArgs) {
  // Redirect to products if already logged in
  const user = getAuthenticatedUser(request);
  if (user) {
    throw redirect('/products');
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  // Validate inputs
  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  if (username.length < 3) {
    return { error: 'Username must be at least 3 characters' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  try {
    // Check if username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return { error: 'Username already taken' };
    }

    // Create new user
    const hashedPassword = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        hashedPassword,
        isAdmin: false,
      })
      .returning();

    // Generate JWT token
    const token = generateToken({
      userId: newUser.userId,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
    });

    // Set cookie and redirect
    return redirect('/products', {
      headers: {
        'Set-Cookie': createAuthCookie(token),
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'An error occurred during signup' };
  }
}

export default function Signup() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 right-12 h-64 w-64 rounded-full bg-purple-500/35 blur-3xl" />
        <div className="absolute top-1/2 left-4 h-72 w-72 -translate-y-1/2 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="absolute bottom-[-12%] right-1/4 h-60 w-60 rounded-full bg-indigo-500/30 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-orange-400 text-4xl shadow-[0_20px_60px_-30px_rgba(236,72,153,0.75)]">
            ✨
          </div>
          <h2 className="mt-6 text-4xl font-semibold text-white">
            Join the Marketplace
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Create your account and start shopping
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
                placeholder="Choose a username"
              />
              <p className="mt-1 text-xs text-white/60">At least 3 characters</p>
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
                placeholder="Create a password"
              />
              <p className="mt-1 text-xs text-white/60">At least 6 characters</p>
            </div>

            {actionData?.error && (
              <div className="rounded-2xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                ❌ {actionData.error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-400 py-3.5 text-sm font-semibold text-white shadow-[0_25px_70px_-35px_rgba(244,114,182,0.75)] transition hover:shadow-[0_30px_80px_-40px_rgba(249,115,22,0.65)]"
            >
              Create Account 🎉
            </button>
          </Form>

          <div className="mt-6 text-center text-sm text-white/70">
            <span>Already have an account? </span>
            <a href="/login" className="font-semibold text-fuchsia-300 transition hover:text-orange-200">
              Log in →
            </a>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 backdrop-blur">
          <p className="mb-2 text-center font-semibold text-white">
            Why join us?
          </p>
          <div className="flex justify-center gap-4 text-white/80">
            <span>✨ Unique Items</span>
            <span>🎁 Instant Access</span>
            <span>💜 Easy Shopping</span>
          </div>
        </div>
      </div>
    </div>
  );
}
