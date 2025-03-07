import { Observable } from 'rxjs';

export interface ISignUpService {
  signup(userData: {
    username: string;
    email: string;
    password: string;
  }): Observable<any>;
}
