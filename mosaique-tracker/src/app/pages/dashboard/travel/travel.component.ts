import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService, Travel } from '../../../core/services/data.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-travel.component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzFormModule,
    NzDatePickerModule,
    NzTagModule
  ],
  templateUrl: './travel.component.html',
  styleUrl: './travel.component.scss',
})
export class TravelComponent {
  private dataService = inject(DataService);
  private fb = inject(FormBuilder);

  searchTerm = '';
  private searchQuery = signal('');

  list = this.dataService.travelList;

  filteredList = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query)
      return this.list();
    return this.list().filter(item =>
      item.city.toLowerCase().includes(query) ||
      item.country.toLowerCase().includes(query) ||
      item.mainObjective.toLowerCase().includes(query)
    )
  });

  isVisible = false;
  isEditing = false;
  editingId: string | null = null;

  form: FormGroup = this.fb.group({
    city: ['', Validators.required],
    country: ['', Validators.required],
    date: [null, Validators.required],
    budget: [null, [Validators.required, Validators.min(0)]],
    mainObjective: ['', Validators.required]
  });

  sortCity = (a: Travel, b: Travel) => a.city.localeCompare(b.city);
  sortCountry = (a: Travel, b: Travel) => a.country.localeCompare(b.country);
  sortDate = (a: Travel, b: Travel) => new Date(a.date).getTime() - new Date(b.date).getTime();
  sortBudget = (a: Travel, b: Travel) => a.budget - b.budget;
  sortObj = (a: Travel, b: Travel) => a.mainObjective.localeCompare(b.mainObjective);

  onSearch(): void {
    this.searchQuery.set(this.searchTerm);
  }

  showModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.form.reset({ budget: 0, date: new Date() });
    this.isVisible = true;
  }

  edit(data: Travel): void {
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
        this.dataService.update(this.list, this.editingId, this.form.value);
      } else {
        this.dataService.add(this.list, this.form.value);
      }
      this.isVisible = false;
    } else {
      Object.values(this.form.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }
}
