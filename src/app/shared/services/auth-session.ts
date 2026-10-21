import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api';

export interface Sesion {
  userId: string;
  name: string;
  email: string;
  token: string;
  expiresAt: string;
  roles: string[];
}

const STORAGE_KEY = 'sws.session.v1';

/** Sesión del panel admin (JWT de SWS.Api). */
@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _session = signal<Sesion | null>(this.load());

  readonly session = this._session.asReadonly();
  readonly isAdmin = computed(() => {
    const s = this._session();
    return !!s && s.roles.includes('Admin') && new Date(s.expiresAt).getTime() > Date.now();
  });

  get token(): string | null {
    return this.isAdmin() ? this._session()!.token : null;
  }

  login(email: string, password: string): Observable<Sesion> {
    return this.http.post<Sesion>(this.api.url('auth/login'), { email, password }).pipe(
      tap((s) => {
        this._session.set(s);
        if (this.isBrowser) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      }),
    );
  }

  logout(reason?: 'session'): void {
    this._session.set(null);
    if (this.isBrowser) localStorage.removeItem(STORAGE_KEY);
    void this.router.navigate(['/admin/login'], reason ? { queryParams: { reason } } : {});
  }

  private load(): Sesion | null {
    if (!this.isBrowser) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Sesion) : null;
    } catch {
      return null;
    }
  }
}
