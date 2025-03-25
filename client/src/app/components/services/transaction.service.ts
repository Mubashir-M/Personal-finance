import { Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TokenService } from '../auth/token.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Transaction } from '../../models/transaction.model';
import { response } from 'express';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = environment.apiUrl;
  transactionsSignal = signal<Transaction[]>([]);

  categories = [
    { id: 1, name: 'Transportation' },
    { id: 2, name: 'Other' },
    { id: 3, name: 'Groceries' },
    { id: 4, name: 'Pharmacy' },
    { id: 5, name: 'Food' },
    { id: 6, name: 'Finance' },
    { id: 7, name: 'Utilities' },
    { id: 8, name: 'Fitness' },
    { id: 9, name: 'Retail' },
    { id: 10, name: 'Healthcare' },
    { id: 11, name: 'Salary' },
  ];

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

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  transactions(): WritableSignal<Transaction[]> {
    return this.transactionsSignal;
  }

  updateCategory(transaction: any) {
    const token = this.tokenService.getToken();
    if (!token) {
      throw new Error('No token found.');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Transaction: ', transaction);
    this.http
      .put(
        `${this.apiUrl}/transaction/${transaction.transaction_id}`,
        { category_id: Number(transaction.category_id) },
        { headers }
      )
      .subscribe(
        (response) => {
          console.log('Category updated successfully:', response);
        },
        (error) => {
          console.error('Error updating category:', error);
        }
      );
  }
}
