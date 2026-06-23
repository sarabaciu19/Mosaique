import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
    email: string;
    firstName: string;
    lastName: string;
    password: string; // string pt ca nu avem backend
}

export interface LoggedUser {
    email: string;
    firstName?: string;
    lastName?: string;
}

const USERS_KEY = 'mosaique_users';
const SESSION_KEY = 'mosaique_session';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private currentUser = signal<LoggedUser | null>(null); // signal pentru a stoca utilizatorul curent

    constructor() {
        const saved = localStorage.getItem(SESSION_KEY);
        if (saved) {
            this.currentUser.set(JSON.parse(saved));
        }
    }

    private getUsers(): User[] {
        const raw = localStorage.getItem(USERS_KEY);
        return raw ? JSON.parse(raw) : [];
    }

    private saveUsers(users: User[]): void {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // API
    login(credentials: { email: string; password: string; rememberMe: boolean }): Observable<any> {
        return this.http.post<{ token: string }>('https://reqres.in/api/login',
            {
                email: credentials.email,
                password: credentials.password
            }
        ).pipe(
            tap(response => {
                const session: LoggedUser = {
                    email: credentials.email,
                    firstName: 'User',
                    lastName: 'Test'
                };
                this.currentUser.set(session);
                if (credentials.rememberMe) {
                    localStorage.setItem('mosaique_session', JSON.stringify(session));
                }
            })
        );
    }

    register(data: { email: string; firstName: string; lastName: string; password: string }): Observable<any> {
        return this.http.post<{ id: number; token?: string }>('https://reqres.in/api/register',
            {
                email: data.email,
                password: data.password
            }
        );
    }

    logout(): void {
        this.currentUser.set(null);
        localStorage.removeItem(SESSION_KEY);
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        return this.currentUser() !== null;
    }
}
