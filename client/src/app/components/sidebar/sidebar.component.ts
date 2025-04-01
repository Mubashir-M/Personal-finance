import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ActivePageService } from '../services/activePageService';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  activeDiv: string = '';
  sidebarCollapsed: boolean = false;
  private activePageSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    private activePageService: ActivePageService
  ) {}

  @Output() sidebarToggle = new EventEmitter<boolean>();

  ngOnInit() {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateActivePage(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateActivePage(url: string) {
    let activePage = '';

    // Decide active page based on the URL
    if (url == '/' || url.includes('/dashboard')) {
      activePage = 'dashboard';
    } else if (url.includes('/breakdown')) {
      activePage = 'breakdown';
    } else if (url.includes('/transactions')) {
      activePage = 'transactions';
    } else if (url.includes('/uploads')) {
      activePage = 'uploads';
    } else {
      activePage = '';
    }

    // Update the active page in the ActivePageService
    this.activePageService.setActivePage(activePage);
    this.activeDiv = activePage;

    console.log('Active page based on URL:', activePage);
  }

  setActive(divName: string) {
    this.activeDiv = divName;
    if (this.activeDiv == 'logout') {
      this.authService.logout();
      console.log('user is logging out!');
      this.router.navigate(['auth']);
    }
    console.log('clicked', this.activeDiv);
  }

  menuBtnClk() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.sidebarToggle.emit(this.sidebarCollapsed);
    this.cdr.detectChanges();
    console.log('Sidebar toggled:', this.sidebarCollapsed);
  }
}
