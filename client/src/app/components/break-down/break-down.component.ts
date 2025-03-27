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
import { Observable } from 'rxjs';
import { UIStateService } from './UIStateService';
import { ExpenseDataTransformer } from './ExpenseDataTransformer';

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
  monthlyCategorized: any[] = [];
  view: [number, number] = [700, 400];
  colorScheme = 'cool';

  selectedBar: string = '';
  customColors: any[] = [];
  currentYearIndex: number = 0;
  years: any[] = [];

  constructor(
    private expenseService: ExpenseService,
    private uiStateService: UIStateService,
    private expenseDataTransformer: ExpenseDataTransformer
  ) {}

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses() {
    this.expenseService.getMonthlyExpenses().subscribe(
      (data: any) => {
        if (!Array.isArray(data)) {
          return;
        }

        data = data.map((expense: { total: number }) => {
          expense.total = Math.abs(expense.total);
          return expense;
        });

        this.years = this.expenseDataTransformer.groupDataByYear(data);
        this.updateYearlyData();
        this.updateCustomColors();
      },
      (error) => {
        console.error('Error fetching expenses: ', error);
      }
    );
  }

  loadmonthlyzategorize(year?: number, month?: number) {
    // Check if year and month are undefined, if so, use the latest data
    if (year === undefined || month === undefined) {
      if (this.years.length > 0) {
        const latestYearData = this.years[0];
        year = latestYearData.year;
        month = Math.max(...latestYearData.expenses.map((e: any) => e.month));
      } else {
        console.warn('No expense data available');
        return;
      }
    }

    // Proceed only if year and month are valid
    if (year && month) {
      this.expenseService.getMonthlyCategoziredExpenses(year, month).subscribe({
        next: (response) => {
          this.monthlyCategorized =
            this.expenseDataTransformer.mapMonthlyCategorizedExpenses(response);
          this.updateCustomColors();
        },
        error: (error) => {
          console.error('Error fetching monthly categorized expenses:', error);
        },
      });
    } else {
      console.warn('Invalid year or month provided');
    }
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
        name: this.expenseService.getMonthName(expense.month),
        value: expense.total,
        month: expense.month,
        year: this.years[this.currentYearIndex].year,
      }))
      .reverse();

    // Set the latest month as the selected bar
    if (this.currentYearIndex === 0 && this.expenses.length > 0) {
      this.selectedBar = this.expenses[this.expenses.length - 1].name;
      const latestExpense = this.expenses[this.expenses.length - 1];
      this.loadmonthlyzategorize(latestExpense.year, latestExpense.month);
    } else {
      this.selectedBar = '';
    }
  }

  onBarClick(event: any) {
    console.log('Clicked on bar: ', event);
    this.selectedBar = event.name;

    // Find corresponding year and month
    const selectedExpense = this.expenses.find((e) => e.name === event.name);
    if (selectedExpense) {
      this.loadmonthlyzategorize(selectedExpense.year, selectedExpense.month);
    }
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
}
