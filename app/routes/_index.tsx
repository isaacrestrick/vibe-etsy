import { redirect } from 'react-router';
import type { Route } from './+types/_index';
import { getAuthenticatedUser } from '~/lib/auth.server';

export async function loader({ request }: Route.LoaderArgs) {
  const user = getAuthenticatedUser(request);

  // Redirect to appropriate page based on auth status
  if (user) {
    if (user.isAdmin) {
      throw redirect('/admin');
    }
    throw redirect('/products');
  }

  throw redirect('/login');
}
