import { Component } from '@angular/core';
import { FinanceChartComponent } from '../finance-chart/finance-chart.component';
import { SavingsComponent } from '../savings/savings.component';

@Component({
  selector: 'app-home',
  imports: [FinanceChartComponent, SavingsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
