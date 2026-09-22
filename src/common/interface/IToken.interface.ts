// Login / refresh javobidagi tokenlar
export interface IToken {
  accessToken: string; // JWT
  refreshToken: string; // Opaque satr
  accessTokenExpiresIn: number; // Sekundlarda
}
