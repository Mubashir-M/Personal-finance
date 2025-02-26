import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  activeDiv: string | null = null;

  setActive(divName: string) {
    this.activeDiv = divName;
    console.log('clicked', this.activeDiv);
  }
}
