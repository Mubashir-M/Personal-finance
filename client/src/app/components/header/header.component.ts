import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [FormsModule, MatIconModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  searchInputText = '';
  isLoggedIn: boolean = false;
  dropdownOpen = false;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }

  onLogout() {
    this.authService.logout();
    console.log('user is logging out!');
    this.router.navigate(['auth']);
  }

  onSearchInputChanged() {
    console.log(this.searchInputText);
  }

  toggleDropDown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
