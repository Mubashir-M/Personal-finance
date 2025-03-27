import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivePageService {
  private activePageSource = new Subject<string>();
  activePage$ = this.activePageSource.asObservable();

  setActivePage(page: string) {
    this.activePageSource.next(page);
  }
}
