import { Injectable, inject, signal } from '@angular/core';
import { CredentialsDto } from '../dto/credentials.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { HttpClient } from '@angular/common/http';
import { API } from '../../../config/api.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  isAuthenticated = signal(false);
  userId = signal<string | null>(null);
  email = signal<string | null>(null);

  constructor() {
    this.loadAuthState();
  }

  private loadAuthState() {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedEmail = localStorage.getItem('email');

    if (token && storedUserId) {
      this.isAuthenticated.set(true);
      this.userId.set(storedUserId);
      this.email.set(storedEmail);
    }
  }

  login(credentials: CredentialsDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(API.login, credentials);
  }

  setAuthState(token: string, userId: string, email: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    if (email) {
      localStorage.setItem('email', email);
    }

    this.isAuthenticated.set(true);
    this.userId.set(userId);
    this.email.set(email);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');

    this.isAuthenticated.set(false);
    this.userId.set(null);
    this.email.set(null);
  }
}
