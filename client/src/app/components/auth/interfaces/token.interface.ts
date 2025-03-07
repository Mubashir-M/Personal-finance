import { Observable } from 'rxjs';

export interface ITokenService {
  setLoggedIn(token: string): void;
  logout(): void;
  getToken(): string | null;
}
