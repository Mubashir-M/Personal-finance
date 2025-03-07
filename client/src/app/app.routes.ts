import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthComponent } from './components/auth/auth.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
];
