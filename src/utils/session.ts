import type { ApiUser } from '../api/types';

const USER_KEY = 'pocketsync_user';

export function persistUser(user: ApiUser): void {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadPersistedUser(): ApiUser | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

export function clearPersistedUser(): void {
  sessionStorage.removeItem(USER_KEY);
}