import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UIStateService {
  selectedBar: string = '';
  customColor: any[] = [];

  updateSelectedBar(expenses: any[], selectedBar: string) {
    this.selectedBar = selectedBar;
    this.updateCustomColors(expenses);
  }

  updateCustomColors(expenses: any[]) {
    this.customColor = expenses.map((expense) => ({
      name: expense.name,
      value:
        expense.name === this.selectedBar
          ? 'rgba(87,53,210,1)'
          : 'rgba(87,53,210,.65)',
    }));
  }
}
