import { User } from './types';

export class AuthClientService {
  static async getCurrentUser(): Promise<User | null> {
    try {

      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });


      if (!response.ok) {

        return null;
      }

      const json = await response.json();

      return json.user ?? null;
    } catch (error) {
      return null;
    }
  }

  static async signIn(email: string, password: string, rememberMe: boolean = false): Promise<void> {

    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, rememberMe })
    });


    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign in failed');
    }


  }

  static async signOut(): Promise<void> {

    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include'
    });
  }
}
