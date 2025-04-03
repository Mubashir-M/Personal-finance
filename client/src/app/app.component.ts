import {
  Component,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthComponent } from './components/auth/auth.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from './components/auth/auth.service';
import { TokenService } from './components/auth/token.service';

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
  isReady: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoading = true;
      this.authService.isLoggedIn$.subscribe((status) => {
        this.ngZone.run(() => {
          this.isLoggedIn = status;
          this.isLoading = false; // Once state is updated, set loading to false
          this.cdr.detectChanges(); // Explicitly trigger change detection
        });
      });
    }
    console.log('is loading:', this.isLoading);
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
