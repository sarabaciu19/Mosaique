import { Injectable, signal, computed, WritableSignal } from '@angular/core';

// Interfață pentru tracker-ul de divertisment (filme/cărți)
export interface Entertainment {
  id: string;
  title: string;
  author: string; // Autor sau Regizor
  genre: string;
  duration: number; // Durată în minute (filme) sau pagini (cărți)
  status: 'Văzut' | 'Citit' | 'În așteptare' | 'În curs';
  rating: number; // Rating de la 1 la 5 stele
}

// Interfață pentru tracker-ul de Fitness (antrenamente)
export interface Fitness {
  id: string;
  name: string; // Denumire exercițiu
  muscleGroup: 'Legs' | 'Chest' | 'Back' | 'Arms' | 'Core' | 'Cardio' | 'Full Body';
  duration: number; // Durată în minute
  calories: number; // Calorii arse
  date: string; // Data antrenamentului
}

// Interfață pentru tracker-ul de Management (Task-uri)
export interface Management {
  id: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  deadline: string;
  responsible: string;
  status: 'To Do' | 'In Progress' | 'Done';
}

// Interfață pentru tracker-ul de Călătorii (Travel)
export interface Travel {
  id: string;
  city: string;
  country: string;
  date: string;
  budget: number;
  mainObjective: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // 1. Semnale reactive primare pentru stocare (Writable Signals)
  // Sunt populate inițial cu date de test (mock data) pentru prezentare.
  
  public entertainmentList = signal<Entertainment[]>([
    {
      id: 'ent-1',
      title: 'Inception',
      author: 'Christopher Nolan',
      genre: 'Sci-Fi',
      duration: 148,
      status: 'Văzut',
      rating: 5
    },
    {
      id: 'ent-2',
      title: 'Atomic Habits',
      author: 'James Clear',
      genre: 'Self-Help',
      duration: 320,
      status: 'Citit',
      rating: 5
    },
    {
      id: 'ent-3',
      title: 'Dune: Part Two',
      author: 'Denis Villeneuve',
      genre: 'Sci-Fi',
      duration: 166,
      status: 'În curs',
      rating: 4
    }
  ]);

  public fitnessList = signal<Fitness[]>([
    {
      id: 'fit-1',
      name: 'Alergare Ușoară',
      muscleGroup: 'Cardio',
      duration: 35,
      calories: 340,
      date: '2026-06-20'
    },
    {
      id: 'fit-2',
      name: 'Împins de la piept',
      muscleGroup: 'Chest',
      duration: 45,
      calories: 280,
      date: '2026-06-22'
    }
  ]);

  public managementList = signal<Management[]>([
    {
      id: 'task-1',
      description: 'Finisare Proiect Angular standalone',
      priority: 'High',
      deadline: '2026-06-25',
      responsible: 'Echipa Mosaique',
      status: 'In Progress'
    }
  ]);

  public travelList = signal<Travel[]>([
    {
      id: 'trv-1',
      city: 'Rome',
      country: 'Italy',
      date: '2026-09-12',
      budget: 1200,
      mainObjective: 'Vizitare Colosseum și Vatican'
    }
  ]);

  // 2. Semnale derivate (Computed Signals)
  // Acestea calculează dinamic valori pornind de la semnalele primare.
  // Se actualizează automat când listele de bază se schimbă.
  
  public totalCalories = computed(() => {
    return this.fitnessList().reduce((acc, workout) => acc + workout.calories, 0);
  });

  public totalWorkouts = computed(() => {
    return this.fitnessList().length;
  });

  // 3. Metode generice CRUD compatibile cu Angular Signals
  // Folosim imutabilitatea (metode care generează referințe noi de tablou)
  // pentru ca sistemul de reactivitate al semnalelor să detecteze schimbarea stării.

  // ADAUGARE
  public add<T extends { id: string }>(listSignal: WritableSignal<T[]>, item: Omit<T, 'id'>): void {
    const newItem = {
      ...item,
      id: 'id-' + Math.random().toString(36).substring(2, 9)
    } as unknown as T;
    
    // update() primește valoarea curentă și returnează noua valoare (un tablou nou cu noul element la final)
    listSignal.update((currentItems) => [...currentItems, newItem]);
  }

  // ACTUALIZARE
  public update<T extends { id: string }>(
    listSignal: WritableSignal<T[]>,
    id: string,
    updatedFields: Partial<T>
  ): void {
    // Înlocuim elementul cu ID-ul respectiv cu unul nou combinat, restul rămân neschimbate
    listSignal.update((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  }

  // STERGERE
  public delete<T extends { id: string }>(listSignal: WritableSignal<T[]>, id: string): void {
    // Păstrăm în noul tablou doar elementele care NU au ID-ul trimis spre ștergere
    listSignal.update((currentItems) => currentItems.filter((item) => item.id !== id));
  }
}
