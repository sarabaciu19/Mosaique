import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule,
  AbstractControl, ValidatorFn
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) return null;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const onlyLettersAndNumbers = /^[A-Za-z0-9]+$/.test(value);
    const isValid = hasUpperCase && hasLowerCase && hasNumeric && onlyLettersAndNumbers && value.length >= 6;
    return isValid ? null : { passwordStrength: true };
  };
}

export function matchValidator(matchTo: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    return !!control.parent &&
      !!control.parent.value &&
      control.value === (control.parent.controls as any)[matchTo].value
      ? null
      : { matching: true };
  };
}

@Component({
  selector: 'app-register.component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    password: ['', [Validators.required, passwordValidator()]],
    confirmPassword: ['', [Validators.required, matchValidator('password')]],
  });

  loading = false;

  submitForm(): void {
    if (this.registerForm.valid) {
      this.loading = true;

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.message.success('Registration successful! Please log in.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          let errMsg = 'Registration failed. Please try again.';
          if (error?.error?.message) {
            errMsg = Array.isArray(error.error.message)
              ? error.error.message.join(', ')
              : error.error.message;
          } else if (error?.error?.error) {
            errMsg = error.error.error;
          }
          this.message.error(errMsg);
        }
      });
    } else {
      Object.values(this.registerForm.controls).forEach(control => {
        control.markAsDirty(); // dirty = true, adica a fost modificat
        control.updateValueAndValidity({ onlySelf: true }); // recalculam validitatea controlului
      });
    }
  }
}
