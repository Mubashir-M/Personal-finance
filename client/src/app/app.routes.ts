import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthComponent } from './components/auth/auth.component';
import { BreakDownComponent } from './components/break-down/break-down.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { UploadFileComponent } from './components/upload-file/upload-file.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'breakdown', component: BreakDownComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'uploads', component: UploadFileComponent },
];
