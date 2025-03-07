import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ILoginService } from './interfaces/login.interface';
import { ISignUpService } from './interfaces/signup.interface';
import { ITokenService } from './interfaces/token.interface';
import { LoginService } from './login.service';
import { SignUpService } from './signup.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject: BehaviorSubject<boolean>;
  isLoggedIn$!: Observable<boolean>;

  constructor(
    private loginService: LoginService,
    private signupService: SignUpService,
    private tokenService: TokenService
  ) {
    this.isLoggedInSubject = new BehaviorSubject<boolean>(
      !!this.tokenService.getToken()
    );
    this.isLoggedIn$ = this.isLoggedInSubject.asObservable();
  }

  private apiUrl = environment.apiUrl;

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.loginService.login(credentials);
  }

  signup(userData: {
    username: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.signupService.signup(userData);
  }

  logout() {
    this.tokenService.logout();
    this.isLoggedInSubject.next(false);
  }

  setLoggedIn(token: string) {
    this.tokenService.setLoggedIn(token);
    this.isLoggedInSubject.next(true);
  }
}
