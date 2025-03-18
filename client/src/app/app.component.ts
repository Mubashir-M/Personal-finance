import {
  Component,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthComponent } from './components/auth/auth.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from './components/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    SidebarComponent,
    AuthComponent,
    RouterOutlet,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'finance-ai-app';
  isLoading: Boolean = true;
  isLoggedIn: boolean = false;
  sidebarCollapsed = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      this.isLoading = false; // Once status is updated, stop loading spinner
      this.cdr.detectChanges(); // Ensure change detection
      console.log('isLoggedIn after subscribe: ', this.isLoggedIn);
    });

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        this.authService.setLoggedIn(token); // Set logged in state
      } else {
        this.isLoggedIn = false;
        this.isLoading = false;
      }
    }
  }

  onSidebarToggle(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
    console.log('Sidebar expanded:', !this.sidebarCollapsed);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
