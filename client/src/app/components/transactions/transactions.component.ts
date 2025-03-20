import { Component, effect, WritableSignal } from '@angular/core';
import { TransactionService } from '../services/transaction.service';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent {
  transactions!: WritableSignal<Transaction[]>;
  constructor(private transactionsService: TransactionService) {
    this.transactions = this.transactionsService.transactions();
  }

  ngOnInit() {
    this.transactionsService.fetchTransactions();
  }
}
