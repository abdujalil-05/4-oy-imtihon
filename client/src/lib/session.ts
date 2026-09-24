const KEY = 'erp.session';

export function markSignedIn(): void {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* storage may be unavailable */
  }
}

export function markSignedOut(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage may be unavailable */
  }
}

export function hadSession(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
