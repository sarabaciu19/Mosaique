import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-login.component',
  standalone: true, // adica nu depinde de un modul Angular
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzCardModule,
    NzIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true]
  });

  loading = false;

  submitForm(): void {
    if (this.loginForm.invalid)
      this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.message.success('Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        let errMsg = 'Invalid email or password.';
        if (error?.error?.message) {
          errMsg = error.error.message;
        } else if (error?.error?.error) {
          errMsg = error.error.error;
        }
        this.message.error(errMsg);
      }
    });
  }
}
