import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DataService, Entertainment } from '../../../core/services/data.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-entertainment',
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
    NzRateModule,
    NzTagModule,
    NzPopconfirmModule,
    NzCardModule
  ],
  templateUrl: './entertainment.component.html',
  styleUrl: './entertainment.component.css'
})
export class EntertainmentComponent {
  private fb = inject(FormBuilder);
  public dataService = inject(DataService);
  private message = inject(NzMessageService);

  // Semnale locale pentru filtrare și căutare reactivă
  public searchString = signal<string>('');
  public selectedStatus = signal<string>('');

  // Semnale derivate pentru statistici
  public totalCount = computed(() => this.dataService.entertainmentList().length);
  public inProgressCount = computed(() => this.dataService.entertainmentList().filter(i => i.status === 'În curs').length);
  public completedCount = computed(() => this.dataService.entertainmentList().filter(i => i.status === 'Văzut' || i.status === 'Citit').length);
  public averageRating = computed(() => {
    const list = this.dataService.entertainmentList();
    if (list.length === 0) return '0.0';
    const sum = list.reduce((acc, item) => acc + item.rating, 0);
    return (sum / list.length).toFixed(1);
  });

  // Semnal derivat reactiv pentru lista filtrată
  public filteredList = computed(() => {
    const list = this.dataService.entertainmentList();
    const query = this.searchString().toLowerCase().trim();
    const status = this.selectedStatus();

    return list.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.genre.toLowerCase().includes(query);
      
      const matchesStatus = !status || item.status === status;
      return matchesSearch && matchesStatus;
    });
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
      title: ['', [Validators.required, Validators.minLength(2)]],
      author: ['', [Validators.required, Validators.minLength(2)]],
      genre: ['', [Validators.required]],
      duration: [null, [Validators.required, Validators.min(1)]],
      status: ['În așteptare', [Validators.required]],
      rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  // Căutare în timp real
  public onSearchChange(value: string): void {
    this.searchString.set(value);
  }

  // Filtrare status
  public onStatusFilterChange(value: string): void {
    this.selectedStatus.set(value);
  }

  // Modificare rapidă a statusului din tabel (status toggler)
  public toggleStatus(item: Entertainment): void {
    const statusCycle: ('În așteptare' | 'În curs' | 'Văzut' | 'Citit')[] = [
      'În așteptare',
      'În curs',
      'Văzut'
    ];
    
    // Determinăm următorul status în ciclu
    const currentIndex = statusCycle.indexOf(item.status as any);
    let nextIndex = (currentIndex + 1) % statusCycle.length;
    
    // Dacă este carte, putem folosi și statusul 'Citit' în loc de 'Văzut'
    let nextStatus = statusCycle[nextIndex];
    if (nextStatus === 'Văzut' && (item.genre.toLowerCase().includes('carte') || item.genre.toLowerCase().includes('book') || item.genre.toLowerCase().includes('novel') || item.genre.toLowerCase().includes('classic') || item.genre.toLowerCase().includes('literatură'))) {
      nextStatus = 'Citit';
    }

    this.dataService.update<Entertainment>(
      this.dataService.entertainmentList,
      item.id,
      { status: nextStatus as any }
    );
    this.message.info(`Status actualizat la "${nextStatus}" pentru ${item.title}`);
  }

  // Deschiderea modalului de adăugare
  public openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.itemForm.reset({
      title: '',
      author: '',
      genre: '',
      duration: null,
      status: 'În așteptare',
      rating: 3
    });
    this.isModalVisible = true;
  }

  // Deschiderea modalului de editare
  public openEditModal(item: Entertainment): void {
    this.isEditing = true;
    this.editingId = item.id;
    this.itemForm.patchValue({
      title: item.title,
      author: item.author,
      genre: item.genre,
      duration: item.duration,
      status: item.status,
      rating: item.rating
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

    if (this.isEditing && this.editingId) {
      this.dataService.update<Entertainment>(
        this.dataService.entertainmentList,
        this.editingId,
        formValue
      );
      this.message.success('Elementul a fost actualizat!');
    } else {
      this.dataService.add<Entertainment>(
        this.dataService.entertainmentList,
        formValue
      );
      this.message.success('Elementul a fost adăugat!');
    }

    this.isModalVisible = false;
  }

  public handleCancel(): void {
    this.isModalVisible = false;
  }

  // Ștergere
  public deleteItem(id: string): void {
    this.dataService.delete<Entertainment>(this.dataService.entertainmentList, id);
    this.message.success('Elementul a fost șters!');
  }
}
