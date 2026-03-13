const TOKEN_KEY = 'neur_eye_access_token';

let inMemoryToken: string | null = null;

export async function saveAccessToken(token: string) {
  inMemoryToken = token;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export async function loadAccessToken(): Promise<string | null> {
  if (typeof localStorage !== 'undefined') {
    const persisted = localStorage.getItem(TOKEN_KEY);
    if (persisted) {
      inMemoryToken = persisted;
    }
  }
  return inMemoryToken;
}

export async function clearAccessToken() {
  inMemoryToken = null;
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}
