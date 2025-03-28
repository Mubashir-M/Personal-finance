import { Component, effect, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ExpenseService } from '../break-down/expense.service';
import { TokenService } from '../auth/token.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../services/UserService';
import { TransactionService } from '../services/transaction.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-dashboard',
  imports: [NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  host: { class: 'flex-container' },
  animations: [
    trigger('animateCircle', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('2s ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ],
})
export class DashboardComponent {
  transactions: any[] = [];
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
    private userService: UserService,
    private transactionsService: TransactionService
  ) {
    effect(() => {
      this.processTransactions();
    });
  }

  ngOnInit() {
    this.loadUser();
    this.transactionsService.fetchTransactions();
    this.processTransactions();
    this.updateView();
  }

  private resizeTimeout: any;
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.updateView();
    }, 200);
  }

  updateView() {
    const width = window.innerWidth;
    if (width <= 660) {
      this.view = [300, 300];
    } else if (width <= 740) {
      this.view = [350, 300];
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

  processTransactions() {
    const transactions = this.transactionsService.transactions();
    const expensesGrouped: { [key: string]: number } = {};
    const incomesGrouped: { [key: string]: number } = {};
    const incomeSources: { [key: string]: number } = {};

    // Ensure transactions is an array
    if (!Array.isArray(transactions())) {
      console.warn('No transactions available.');
      return;
    }

    transactions().forEach((transaction: Transaction) => {
      const { amount, month, year, merchant } = transaction;
      const monthYear = `${this.expenseService.getMonthName(month)} ${year}`;

      if (amount < 0) {
        if (!expensesGrouped[monthYear]) {
          expensesGrouped[monthYear] = 0;
        }
        expensesGrouped[monthYear] += Math.abs(amount);
      } else {
        if (!incomesGrouped[monthYear]) {
          incomesGrouped[monthYear] = 0;
        }
        incomesGrouped[monthYear] += amount;

        this.income_sources.push(transaction);
      }
    });

    this.expenses = Object.keys(expensesGrouped).map((monthYear) => ({
      monthYear,
      total: expensesGrouped[monthYear],
    }));

    this.incomes = Object.keys(incomesGrouped).map((monthYear) => ({
      monthYear,
      total: incomesGrouped[monthYear],
    }));

    this.prepareChartData();
  }

  prepareChartData() {
    const expensesGrouped: { [key: string]: number } = {};
    const incomesGrouped: { [key: string]: number } = {};

    this.expenses.forEach((expense) => {
      const { monthYear, total } = expense;
      expensesGrouped[monthYear] = total;
    });

    this.incomes.forEach((income) => {
      const { monthYear, total } = income;
      incomesGrouped[monthYear] = total;
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
