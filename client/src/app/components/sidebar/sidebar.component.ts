import { Component, EventEmitter, Output } from '@angular/core';
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
  toggleSideBar: boolean = true;

  @Output() sidebarToggle = new EventEmitter<boolean>();

  setActive(divName: string) {
    this.activeDiv = divName;
    console.log('clicked', this.activeDiv);
  }

  menuBtnClk() {
    this.toggleSideBar = !this.toggleSideBar;
    this.sidebarToggle.emit(this.toggleSideBar);
    console.log('Sidebar toggled:', this.toggleSideBar);
  }
}
