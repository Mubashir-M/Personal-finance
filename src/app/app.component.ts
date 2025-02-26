import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FinanceChartComponent } from './components/finance-chart/finance-chart.component';
import { SavingsComponent } from './components/savings/savings.component';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    SidebarComponent,
    FinanceChartComponent,
    SavingsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'finance-ai-app';
}
