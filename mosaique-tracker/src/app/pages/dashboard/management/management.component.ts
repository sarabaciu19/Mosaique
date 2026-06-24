import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule, ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl, ValidatorFn
} from '@angular/forms';
import { DataService, Management } from '../../../core/services/data.service';
import { StatusIndicatorComponent } from '../../../shared/components/status-indicator/status-indicator.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';

export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(value);
    return date >= today ? null : { pastDate: true };
  };
}

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StatusIndicatorComponent,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTagModule
  ],
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss'
})
export class ManagementComponent {
  private dataService = inject(DataService);
  private fb = inject(FormBuilder);

  searchTerm = '';
  private searchQuery = signal('');

  list = this.dataService.managementList;

  filteredList = computed(() => {
    const term = this.searchQuery().toLowerCase();
    if (!term) return this.list();
    return this.list().filter(item =>
      item.description.toLowerCase().includes(term) ||
      item.responsible.toLowerCase().includes(term)
    );
  });

  isVisible = false;
  isEditing = false;
  editingId: string | null = null;

  form: FormGroup = this.fb.group({
    description: ['', Validators.required],
    priority: ['Medium', Validators.required],
    deadline: [null, [Validators.required, futureDateValidator()]],
    responsible: ['', Validators.required],
    status: ['To Do', Validators.required]
  });

  sortDesc = (a: Management, b: Management) => a.description.localeCompare(b.description);
  sortPriority = (a: Management, b: Management) => a.priority.localeCompare(b.priority);
  sortDeadline = (a: Management, b: Management) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  sortResponsible = (a: Management, b: Management) => a.responsible.localeCompare(b.responsible);

  isOverdue(deadline: string | Date): boolean {
    return new Date(deadline) < new Date();
  }

  onSearch(): void {
    this.searchQuery.set(this.searchTerm);
  }

  showModal(): void {
    this.isEditing = false;
    this.editingId = null;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.form.reset({ priority: 'Medium', status: 'To Do', deadline: tomorrow });
    this.isVisible = true;
  }

  edit(data: Management): void {
    this.isEditing = true;
    this.editingId = data.id;
    this.form.patchValue(data);
    this.isVisible = true;
  }

  delete(id: string): void {
    this.dataService.delete(this.list, id);
  }

  handleOk(): void {
    if (this.form.valid) {
      if (this.isEditing && this.editingId) {
        this.dataService.update<Management>(this.list, this.editingId, this.form.value);
      } else {
        this.dataService.add<Management>(this.list, this.form.value);
      }
      this.isVisible = false;
    } else {
      Object.values(this.form.controls).forEach(c => {
        c.markAsDirty();
        c.updateValueAndValidity({ onlySelf: true });
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  onStatusChange(data: Management, newStatus: string): void {
    this.dataService.update<Management>(this.list, data.id, { status: newStatus as any });
  }
}
