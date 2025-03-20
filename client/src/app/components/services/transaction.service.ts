import { Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TokenService } from '../auth/token.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

interface Transaction {
  amount: number;
  day: number;
  merchant: string;
  month: number;
  year: number;
  monthName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = environment.apiUrl;
  transactionsSignal = signal<Transaction[]>([]);

  constructor(private http: HttpClient, private tokenService: TokenService) {}
  fetchTransactions() {
    const token = this.tokenService.getToken();
    if (!token) {
      throw new Error('No token found.');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`${this.apiUrl}/Transactions`, { headers }).subscribe(
      (data: any) => this.transactionsSignal.set(data),
      (error) => console.error('Error fetching transactions: ', error)
    );
  }

  transactions(): WritableSignal<Transaction[]> {
    return this.transactionsSignal;
  }
}
