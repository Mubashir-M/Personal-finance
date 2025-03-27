import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    private activePageService: ActivePageService
  ) {}

  @Output() sidebarToggle = new EventEmitter<boolean>();

  ngOnInit() {
    this.activePageSubscription = this.activePageService.activePage$.subscribe(
      (page) => {
        this.activeDiv = page;
      }
    );
  }

  ngOnDestroy() {
    if (this.activePageSubscription) {
      this.activePageSubscription.unsubscribe();
    }
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
