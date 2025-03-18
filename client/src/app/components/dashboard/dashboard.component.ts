import { Component, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ExpenseService } from '../break-down/expense.service';
import { TokenService } from '../auth/token.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../services/UserService';

interface Expense {
  total: number;
  month: number;
  year: number;
  monthName?: string; // Optional field for month name
}
interface Income {
  total: number;
  month: number;
  year: number;
  monthName?: string; // Optional field for month name
}

@Component({
  selector: 'app-dashboard',
  imports: [NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  host: { class: 'flex-container' },
  animations: [
    trigger('animateCircle', [
      transition(':enter', [
        style({ strokeDashoffset: 251.2 }), // Starting value
        animate('2s ease-out', style({ strokeDashoffset: 0 })), // Animate to 0
      ]),
    ]),
  ],
})
export class DashboardComponent {
  expenses: any[] = [];
  incomes: any[] = [];
  income_sources: any[] = [];
  Data: any[] = [];
  user: any;

  view: [number, number] = [600, 400];
  colorScheme: Color = {
    name: 'myScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#FFA500', '#5735D2'],
  };

  constructor(
    private httpClient: HttpClient,
    private expenseService: ExpenseService,
    private tokenService: TokenService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadExpenses();
    this.loadIncomes();
    this.loadIncomesBySources();
    this.updateView();
    this.loadUser();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateView();
  }
  updateView() {
    const width = window.innerWidth;
    if (width <= 660) {
      this.view = [300, 200];
    } else if (width <= 740) {
      this.view = [350, 200];
    } else if (width <= 900) {
      this.view = [400, 200];
    } else if (width <= 900) {
      this.view = [450, 300];
    } else if (width <= 1300) {
      this.view = [600, 400];
    } else {
      this.view = [800, 400];
    }
  }

  loadUser() {
    this.userService.getUser().subscribe(
      (data: any) => {
        this.user = data;
      },
      (error) => {
        console.error('Error fetching user.');
      }
    );
  }
  loadExpenses() {
    this.expenseService.getMonthlyExpenses().subscribe(
      (data: any) => {
        data = data.map((expense: Expense) => {
          expense.total = Math.abs(expense.total);
          expense.monthName = this.expenseService.getMonthName(expense.month);
          return expense;
        });
        this.expenses = data;
        this.prepareChartData();
      },
      (error) => {
        console.error('Error fetching expenses: ', error);
      }
    );
  }

  loadIncomes() {
    this.expenseService.getMonthlyIncomes().subscribe(
      (data: any) => {
        data = data.map((income: Income) => {
          income.monthName = this.expenseService.getMonthName(income.month);
          return income;
        });
        this.incomes = data;
        this.prepareChartData();
      },
      (error) => {
        console.error('Error fetching incomes: ', error);
      }
    );
  }

  loadIncomesBySources() {
    this.expenseService.getMonthlyIncomesBySources().subscribe(
      (data: any) => {
        this.income_sources = data.reverse();
      },
      (error) => {
        console.error('Error fetching incomes by sources: ', error);
      }
    );
  }

  prepareChartData() {
    const expensesGrouped: { [key: string]: number } = {};
    const incomesGrouped: { [key: string]: number } = {};

    this.expenses.forEach((expense) => {
      const monthYear = `${expense.monthName} ${expense.year}`;
      if (!expensesGrouped[monthYear]) {
        expensesGrouped[monthYear] = 0;
      }
      expensesGrouped[monthYear] += expense.total;
    });

    this.incomes.forEach((income) => {
      const monthYear = `${income.monthName} ${income.year}`;
      if (!incomesGrouped[monthYear]) {
        incomesGrouped[monthYear] = 0;
      }
      incomesGrouped[monthYear] += income.total;
    });

    // Combine expenses and incomes data
    const allMonths = [
      ...new Set([
        ...Object.keys(expensesGrouped),
        ...Object.keys(incomesGrouped),
      ]),
    ];

    this.Data = [
      {
        name: 'Expenses',
        series: allMonths.map((month) => ({
          name: month,
          value: expensesGrouped[month] || 0,
        })),
      },
      {
        name: 'Incomes',
        series: allMonths.map((month) => ({
          name: month,
          value: incomesGrouped[month] || 0,
        })),
      },
    ];

    this.Data.forEach((chartData) => {
      chartData.series.sort(
        (
          a: { name: string; value: number },
          b: { name: string; value: number }
        ) => new Date(a.name).getTime() - new Date(b.name).getTime()
      );
    });
  }
}
