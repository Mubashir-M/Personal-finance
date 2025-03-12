import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
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

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  ngOnInit() {
    this.getMonthlyExpenses();
    this.updateCustomColors();
    console.log('current-year: ', this.currentYearIndex);
  }

  previousYear() {
    console.log('Clicked prev');
    if (this.currentYearIndex < this.years.length - 1) {
      this.currentYearIndex++;
      console.log('current-year: ', this.years[this.currentYearIndex].year);
      this.updateYearlyData();
      this.updateCustomColors();
    }
  }

  nextYear() {
    console.log('Clicked next');
    if (this.currentYearIndex > 0) {
      this.currentYearIndex--;
      console.log('current-year: ', this.years[this.currentYearIndex].year);
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

  getMonthlyExpenses() {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found.');
      return;
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http
      .get('http://localhost:8000/expenses/monthly-total', { headers })
      .subscribe(
        (data: any) => {
          // Group data by year
          data = data.map((expense: { total: number }) => {
            expense.total = Math.abs(expense.total);
            return expense;
          });

          this.years = this.groupDataByYear(data);
          this.updateYearlyData();

          this.updateCustomColors();
        },
        (error) => {
          console.error('Error fetching expenses', error);
        }
      );
  }

  groupDataByYear(data: any[]) {
    const yearsMap = new Map<number, { year: number; expenses: any[] }>();
    data.forEach((expense: any) => {
      const year = expense.year;
      if (!yearsMap.has(year)) {
        yearsMap.set(year, { year, expenses: [] });
      }
      yearsMap.get(year)?.expenses.push(expense);
    });
    return Array.from(yearsMap.values());
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

// Refactor code.
