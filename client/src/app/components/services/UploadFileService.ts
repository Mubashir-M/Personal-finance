import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from '../auth/token.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadFileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  UploadFile(file: File): Observable<any> {
    const token = this.tokenService.getToken();

    if (!token) {
      throw new Error('No token found.');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const fd = new FormData();
    fd.append('file', file, file.name);

    return this.http.post(`${this.apiUrl}/upload`, fd, { headers: headers });
  }
}
