import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
    email: string;
    firstName: string;
    lastName: string;
    password: string; // string pt ca nu avem backend
}

export interface LoggedUser {
    email: string;
    firstName: string;
    lastName: string;
}

const USERS_KEY = 'mosaique_users';
const SESSION_KEY = 'mosaique_session';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUser = signal<LoggedUser | null>(null); // signal pentru a stoca utilizatorul curent

    constructor(private router: Router) {
        this.seedDemoUser();

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

    private seedDemoUser(): void {
        const users = this.getUsers();
        const demo = users.find(u => u.email === 'demo@mosaique.ro');

        if (!demo) {
            users.push({
                email: 'demo@mosaique.ro',
                firstName: 'Demo',
                lastName: 'User',
                password: 'demo'
            });
            this.saveUsers(users);
        }
    }

    // API
    login(credentials: { email: string; password: string; rememberMe: boolean }): { success: boolean; error?: string } {
        const users = this.getUsers();
        const found = users.find(u => u.email === credentials.email
            && u.password === credentials.password);

        if (!found) {
            return { success: false, error: 'Invalid email or password' };
        }
        const session: LoggedUser = {
            email: found.email,
            firstName: found.firstName,
            lastName: found.lastName
        };

        this.currentUser.set(session);

        if (credentials.rememberMe) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }

        return { success: true };
    }

    register(data: { email: string; firstName: string; lastName: string; password: string }): { success: boolean; error?: string } {
        const users = this.getUsers();
        const exists = users.find(u => u.email === data.email);

        if (exists) {
            return { success: false, error: 'User with this email already exists' };
        }

        users.push({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password
        });

        this.saveUsers(users);
        return { success: true };
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
