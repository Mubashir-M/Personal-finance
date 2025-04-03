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

  originalCategory: number | null = null;
  changedTransaction: any | null = null;

  constructor(private transactionsService: TransactionService) {
    this.transactions = this.transactionsService.transactions();
  }

  filteredTransactions = computed(() => {
    const searchText = this.searchInputText().toLowerCase().trim();
    const transactionsList = this.transactions() || [];
    return transactionsList.filter(
      (transaction) =>
        transaction.merchant.toLowerCase().includes(searchText) ||
        transaction.category.toLowerCase().includes(searchText) ||
        transaction.amount.toString().includes(searchText)
    );
  });

  ngOnInit() {
    this.transactionsService.fetchTransactions();
  }

  onCategoryChange(transaction: any) {
    this.originalCategory = transaction.category_id;
    if (
      confirm(
        `Confirm changing cateogry ${
          transaction.category
        } to ${this.transactionsService.getCategoryName(
          Number(transaction.category_id)
        )}.`
      )
    ) {
      this.changedTransaction = transaction;
      this.transactionsService.updateCategory(this.changedTransaction);
      this.changedTransaction = null;
    } else {
      transaction.category_id = this.originalCategory;
      this.originalCategory = null;
      this.transactionsService.fetchTransactions();
    }
  }

  onSearchInputChanged() {
    console.log(this.searchInputText);
  }
}
