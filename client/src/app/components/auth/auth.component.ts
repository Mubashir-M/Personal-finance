import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, CommonModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  email: string = '';
  username: string = '';
  password: string = '';
  loginError: boolean = false;
  isSignup: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    console.log('Logging in with:', this.email, this.password);
  }

  onSubmit() {
    if (this.isSignup) {
      this.authService
        .signup({
          username: this.username,
          email: this.email,
          password: this.password,
        })
        .subscribe({
          next: (response) => {
            console.log('User created:', response);
            this.authService.setLoggedIn(response.token);
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Sign up error:', error);
            this.loginError = true;
          },
          complete: () => {
            this.email = '';
            this.password = '';
            this.username = '';
            console.log('Signup request completed.');
          },
        });
    } else {
      this.authService
        .login({ email: this.email, password: this.password })
        .subscribe({
          next: (response) => {
            console.log('Logged in:', response);
            this.authService.setLoggedIn(response.token);
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Login error:', error);
            this.loginError = true;
          },
          complete: () => {
            this.email = '';
            this.password = '';
            console.log('Login request completed.');
          },
        });
    }
  }

  toggleSignup() {
    this.isSignup = !this.isSignup;
  }
}
