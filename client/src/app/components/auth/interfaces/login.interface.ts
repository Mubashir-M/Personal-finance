import { Observable } from 'rxjs';

export interface ILoginService {
  login(credentials: { email: string; password: string }): Observable<any>;
}
