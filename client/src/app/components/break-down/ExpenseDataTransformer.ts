import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root', // makes the service available app-wide
})
export class ExpenseDataTransformer {
  transformExpenseData(
    expenses: any[],
    isForYearlyData: boolean = false
  ): any[] {
    return expenses.map((expense: any) => ({
      name: isForYearlyData ? this.getMonthName(expense.month) : expense.name,
      value: Math.abs(expense.total),
      month: expense.month,
      year: expense.year,
    }));
  }

  mapMonthlyCategorizedExpenses(expenses: any[]): any[] {
    return expenses.map((expense) => ({
      name: expense.category_name,
      value: Math.abs(expense.total_expenses),
    }));
  }

  groupDataByYear(data: any[]): any[] {
    const yearsMap = new Map<number, { year: number; expenses: any[] }>();

    data.forEach((expense) => {
      const year = expense.year;
      if (!yearsMap.has(year)) {
        yearsMap.set(year, { year, expenses: [] });
      }
      yearsMap.get(year)?.expenses.push(expense);
    });
    return Array.from(yearsMap.values());
  }

  private getMonthName(month: number): string {
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
