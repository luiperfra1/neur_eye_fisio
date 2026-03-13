import { apiRequest } from '@/services/apiClient';

export interface AuthUser {
  id: string;
  username: string;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: AuthUser;
}

export async function login(username: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { username, password },
  });
}
