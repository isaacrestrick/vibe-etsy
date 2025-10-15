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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our Etsy-style marketplace
          </p>
        </div>

        <Form method="post" className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter password"
              />
            </div>
          </div>

          {actionData?.error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{actionData.error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Up
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Log in
            </a>
          </div>
        </Form>
      </div>
    </div>
  );
}
