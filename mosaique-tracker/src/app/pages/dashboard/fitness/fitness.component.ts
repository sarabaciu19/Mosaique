import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DataService, Fitness } from '../../../core/services/data.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-fitness',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzDatePickerModule,
    NzPopconfirmModule,
    NzCardModule,
    NzTagModule,
    NzToolTipModule
  ],
  templateUrl: './fitness.component.html',
  styleUrl: './fitness.component.css'
})
export class FitnessComponent {
  private fb = inject(FormBuilder);
  public dataService = inject(DataService);
  private message = inject(NzMessageService);

  // Semnale locale pentru filtrare și căutare reactivă
  public searchString = signal<string>('');
  public selectedMuscleGroup = signal<string>('');

  // Semnal derivat reactiv pentru lista filtrată
  public filteredList = computed(() => {
    const list = this.dataService.fitnessList();
    const query = this.searchString().toLowerCase().trim();
    const muscle = this.selectedMuscleGroup();

    return list.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(query);
      const matchesMuscle = !muscle || item.muscleGroup === muscle;
      return matchesSearch && matchesMuscle;
    });
  });

  // Semnale derivate suplimentare pentru statistici
  public totalDuration = computed(() => {
    return this.dataService.fitnessList().reduce((acc, workout) => acc + workout.duration, 0);
  });

  public favoriteMuscleGroup = computed(() => {
    const list = this.dataService.fitnessList();
    if (list.length === 0) return 'N/A';
    
    const counts: Record<string, number> = {};
    list.forEach((workout) => {
      counts[workout.muscleGroup] = (counts[workout.muscleGroup] || 0) + 1;
    });

    let favorite = 'N/A';
    let maxCount = 0;
    
    for (const group in counts) {
      if (counts[group] > maxCount) {
        maxCount = counts[group];
        favorite = group;
      }
    }
    
    return favorite;
  });

  // Gestiune Modal și Formular
  public isModalVisible = false;
  public isEditing = false;
  private editingId: string | null = null;
  public itemForm!: FormGroup;

  // Variabilă pentru legarea căutării prin ngModel
  public searchTermModel = '';

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      muscleGroup: ['Cardio', [Validators.required]],
      duration: [null, [Validators.required, Validators.min(1)]],
      calories: [null, [Validators.required, Validators.min(1)]],
      date: [new Date(), [Validators.required]]
    });
  }

  // Căutare în timp real
  public onSearchChange(value: string): void {
    this.searchString.set(value);
  }

  // Filtrare grup muscular
  public onMuscleGroupFilterChange(value: string): void {
    this.selectedMuscleGroup.set(value);
  }

  // Deschiderea modalului de adăugare
  public openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.itemForm.reset({
      name: '',
      muscleGroup: 'Cardio',
      duration: null,
      calories: null,
      date: new Date()
    });
    this.isModalVisible = true;
  }

  // Deschiderea modalului de editare
  public openEditModal(item: Fitness): void {
    this.isEditing = true;
    this.editingId = item.id;
    
    // Convertim data string la obiect Date pentru DatePicker
    const dateObj = item.date ? new Date(item.date) : new Date();
    
    this.itemForm.patchValue({
      name: item.name,
      muscleGroup: item.muscleGroup,
      duration: item.duration,
      calories: item.calories,
      date: dateObj
    });
    this.isModalVisible = true;
  }

  // Salvarea formularului (Add/Edit)
  public handleSave(): void {
    if (this.itemForm.invalid) {
      Object.values(this.itemForm.controls).forEach((control) => {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      });
      return;
    }

    const formValue = this.itemForm.value;
    
    // Formatăm obiectul Date într-un string YYYY-MM-DD
    let dateStr = '';
    if (formValue.date instanceof Date) {
      const d = formValue.date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    } else if (typeof formValue.date === 'string') {
      dateStr = formValue.date.split('T')[0];
    } else {
      dateStr = new Date().toISOString().split('T')[0];
    }

    const payload = {
      ...formValue,
      date: dateStr
    };

    if (this.isEditing && this.editingId) {
      this.dataService.update<Fitness>(
        this.dataService.fitnessList,
        this.editingId,
        payload
      );
      this.message.success('Antrenamentul a fost actualizat!');
    } else {
      this.dataService.add<Fitness>(
        this.dataService.fitnessList,
        payload
      );
      this.message.success('Antrenamentul a fost adăugat!');
    }

    this.isModalVisible = false;
  }

  public handleCancel(): void {
    this.isModalVisible = false;
  }

  // Ștergere antrenament
  public deleteItem(id: string): void {
    this.dataService.delete<Fitness>(this.dataService.fitnessList, id);
    this.message.success('Antrenamentul a fost șters!');
  }
}
