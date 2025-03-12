import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  activeDiv: string | null = null;
  sidebarCollapsed: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  @Output() sidebarToggle = new EventEmitter<boolean>();

  setActive(divName: string) {
    this.activeDiv = divName;
    console.log('clicked', this.activeDiv);
  }

  menuBtnClk() {
    this.sidebarCollapsed = !this.sidebarCollapsed; // Toggle the state
    this.sidebarToggle.emit(this.sidebarCollapsed); // Emit the new state
    this.cdr.detectChanges(); // Ensure the view is updated
    console.log('Sidebar toggled:', this.sidebarCollapsed);
  }
}
