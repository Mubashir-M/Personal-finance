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

  constructor() {}

  onSearchInputChanged() {
    console.log(this.searchInputText);
  }

  toggleDropDown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
