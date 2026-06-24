import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

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
        return this.http.post<{ access_token: string }>('https://api.escuelajs.co/api/v1/auth/login',
            {
                email: credentials.email,
                password: credentials.password
            }
        ).pipe(
            switchMap(response => {
                // Fetch profile using token to get real user details
                return this.http.get<any>('https://api.escuelajs.co/api/v1/auth/profile', {
                    headers: {
                        Authorization: `Bearer ${response.access_token}`
                    }
                }).pipe(
                    tap(profile => {
                        const nameParts = profile.name ? profile.name.split(' ') : ['User', 'Test'];
                        const session: LoggedUser = {
                            email: profile.email,
                            firstName: nameParts[0] || 'User',
                            lastName: nameParts.slice(1).join(' ') || 'Test'
                        };
                        this.currentUser.set(session);
                        if (credentials.rememberMe) {
                            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                        }
                    })
                );
            })
        );
    }

    register(data: { email: string; firstName: string; lastName: string; password: string }): Observable<any> {
        return this.http.post<{ id: number }>('https://api.escuelajs.co/api/v1/users/',
            {
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                password: data.password,
                avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + encodeURIComponent(data.firstName)
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
