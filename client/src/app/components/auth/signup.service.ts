import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ISignUpService } from './interfaces/signup.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignUpService implements ISignUpService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  signup(userData: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/`, userData);
  }
}
