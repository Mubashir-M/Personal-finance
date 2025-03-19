import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../auth/token.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getTransactions(): Observable<any> {
    const token = this.tokenService.getToken();
    if (!token) {
      throw new Error('No token found.');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/Transactions`, { headers });
  }

  getMonthlyExpenses(): Observable<any> {
    const token = this.tokenService.getToken();

    if (!token) {
      throw new Error('No token found.');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/expenses/monthly-total`, { headers });
  }

  getMonthlyIncomes(): Observable<any> {
    const token = this.tokenService.getToken();
    if (!token) {
      throw new Error('No token found.');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/incomes/monthly-total`, { headers });
  }

  getMonthlyIncomesBySources(): Observable<any> {
    const token = this.tokenService.getToken();
    if (!token) {
      throw new Error('No token found.');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/incomes`, { headers });
  }

  getMonthlyCategoziredExpenses(year: number, month: number): Observable<any> {
    const token = this.tokenService.getToken();

    if (!token) {
      throw new Error('No token Found');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/expenses/monthly-categories`, {
      headers,
      params: new HttpParams()
        .set('year', year.toString())
        .set('month', month.toString()),
    });
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
