import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../auth/token.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses/monthly-total`;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getMonthlyExpenses(): Observable<any> {
    const token = this.tokenService.getToken();

    if (!token) {
      throw new Error('No token found.');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(this.apiUrl, { headers });
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
}
