import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ExpenseService } from './expense.service';
import { TokenService } from '../auth/token.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-break-down',
  imports: [NgxChartsModule],
  templateUrl: './break-down.component.html',
  styleUrl: './break-down.component.scss',
  schemas: [NO_ERRORS_SCHEMA],
  animations: [
    trigger('animationState', [
      state('active', style({ opacity: 1 })),
      state('inactive', style({ opacity: 0 })),
      transition('active <=> inactive', [animate('1s')]),
    ]),
  ],
})
export class BreakDownComponent {
  expenses: any[] = [];
  view: [number, number] = [700, 400];
  colorScheme = 'cool';

  selectedBar: string = '';
  customColors: any[] = [];
  currentYearIndex: number = 0;
  years: any[] = [];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    this.loadExpenses();
    this.updateCustomColors();
    console.log('current-year: ', this.currentYearIndex);
  }

  loadExpenses() {
    this.expenseService.getMonthlyExpenses().subscribe(
      (data: any) => {
        data = data.map((expense: { total: number }) => {
          expense.total = Math.abs(expense.total);
          return expense;
        });

        this.years = this.expenseService.groupDataByYear(data);
        this.updateYearlyData();
        this.updateCustomColors();
      },
      (error) => {
        console.error('Error fetching expenses', error);
      }
    );
  }

  previousYear() {
    console.log('Clicked prev');
    if (this.currentYearIndex < this.years.length - 1) {
      this.currentYearIndex++;
      this.updateYearlyData();
      this.updateCustomColors();
    }
  }

  nextYear() {
    console.log('Clicked next');
    if (this.currentYearIndex > 0) {
      this.currentYearIndex--;
      this.updateYearlyData();
      this.updateCustomColors();
    }
  }

  updateYearlyData() {
    this.expenses = this.years[this.currentYearIndex].expenses
      .map((expense: any) => ({
        name: this.getMonthName(expense.month),
        value: expense.total,
      }))
      .reverse();

    // Set the latest month as the selected bar
    if (this.currentYearIndex === 0 && this.expenses.length > 0) {
      this.selectedBar = this.expenses[this.expenses.length - 1].name;
    } else {
      this.selectedBar = '';
    }
  }

  onBarHover(event: any) {
    console.log('Hovered over: ', event);
    this.selectedBar = event.name;
    this.updateCustomColors();
  }

  updateCustomColors() {
    this.customColors = this.expenses.map((expense) => ({
      name: expense.name,
      value:
        expense.name === this.selectedBar
          ? 'rgba(87, 53, 210, 1)'
          : 'rgba(87, 53, 210, 0.65)',
    }));
  }

  getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1];
  }
}
