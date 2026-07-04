import { requireAuth } from './auth';

/** Convenience guard for admin-only routes. */
export const requireAdmin = requireAuth('admin');
