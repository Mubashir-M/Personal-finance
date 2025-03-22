import {
  Component,
  effect,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { TransactionService } from '../services/transaction.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent {
  searchInputText = signal('');
  transactions!: WritableSignal<Transaction[]>;

  constructor(private transactionsService: TransactionService) {
    this.transactions = this.transactionsService.transactions();
  }

  filteredTransactions = computed(() => {
    const searchText = this.searchInputText().toLowerCase().trim();
    return this.transactions().filter(
      (transaction) =>
        transaction.merchant.toLowerCase().includes(searchText) ||
        transaction.category.toLowerCase().includes(searchText) ||
        transaction.amount.toString().includes(searchText)
    );
  });

  ngOnInit() {
    this.transactionsService.fetchTransactions();
  }

  onSearchInputChanged() {
    console.log(this.searchInputText);
  }
}
