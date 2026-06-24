import { Injectable, signal, computed, WritableSignal } from '@angular/core';

// Interfață pentru tracker-ul de divertisment (filme/cărți)
export interface Entertainment {
  id: string;
  title: string;
  author: string; // Author or Director
  genre: string;
  duration: number; // Duration in minutes (movies) or pages (books)
  status: 'Watched' | 'Read' | 'On Hold' | 'In Progress';
  rating: number; // Rating from 1 to 5 stars
}

// Interfață pentru tracker-ul de Fitness (antrenamente)
export interface Fitness {
  id: string;
  name: string; // Exercise name
  muscleGroup: 'Legs' | 'Chest' | 'Back' | 'Arms' | 'Core' | 'Cardio' | 'Full Body';
  duration: number; // Duration in minutes
  calories: number; // Calories burned
  date: string; // Workout date
}

// Interfață pentru tracker-ul de Management (Task-uri)
export interface Management {
  id: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  deadline: string;
  category: 'Work' | 'University' | 'Personal' | 'Shopping' | 'Other';
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
      status: 'Watched',
      rating: 5
    },
    {
      id: 'ent-2',
      title: 'Atomic Habits',
      author: 'James Clear',
      genre: 'Self-Help',
      duration: 320,
      status: 'Read',
      rating: 5
    },
    {
      id: 'ent-3',
      title: 'Dune: Part Two',
      author: 'Denis Villeneuve',
      genre: 'Sci-Fi',
      duration: 166,
      status: 'In Progress',
      rating: 4
    },
    {
      id: 'ent-4',
      title: 'The Matrix',
      author: 'Lana & Lilly Wachowski',
      genre: 'Sci-Fi',
      duration: 136,
      status: 'Watched',
      rating: 5
    },
    {
      id: 'ent-5',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      genre: 'Novel',
      duration: 281,
      status: 'On Hold',
      rating: 4
    },
    {
      id: 'ent-6',
      title: 'Interstellar',
      author: 'Christopher Nolan',
      genre: 'Sci-Fi',
      duration: 169,
      status: 'Watched',
      rating: 5
    },
    {
      id: 'ent-7',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Novel',
      duration: 180,
      status: 'Read',
      rating: 4
    }
  ]);

  public fitnessList = signal<Fitness[]>([
    {
      id: 'fit-1',
      name: 'Light Jogging',
      muscleGroup: 'Cardio',
      duration: 35,
      calories: 340,
      date: '2026-06-20'
    },
    {
      id: 'fit-2',
      name: 'Bench Press',
      muscleGroup: 'Chest',
      duration: 45,
      calories: 280,
      date: '2026-06-22'
    },
    {
      id: 'fit-3',
      name: 'Squats & Lunges',
      muscleGroup: 'Legs',
      duration: 30,
      calories: 220,
      date: '2026-06-23'
    },
    {
      id: 'fit-4',
      name: 'Plank & Crunches',
      muscleGroup: 'Core',
      duration: 15,
      calories: 100,
      date: '2026-06-24'
    },
    {
      id: 'fit-5',
      name: 'Deadlifts',
      muscleGroup: 'Back',
      duration: 40,
      calories: 310,
      date: '2026-06-24'
    },
    {
      id: 'fit-6',
      name: 'Bicep Curls',
      muscleGroup: 'Arms',
      duration: 25,
      calories: 150,
      date: '2026-06-25'
    }
  ]);

  public managementList = signal<Management[]>([
    {
      id: 'task-1',
      description: 'Buy groceries for the week',
      priority: 'Medium',
      deadline: '2026-06-25',
      category: 'Shopping',
      status: 'To Do'
    },
    {
      id: 'task-2',
      description: 'Call dentist for annual checkup',
      priority: 'Low',
      deadline: '2026-06-24',
      category: 'Personal',
      status: 'Done'
    },
    {
      id: 'task-3',
      description: 'Study for the mid-term exam',
      priority: 'High',
      deadline: '2026-06-25',
      category: 'University',
      status: 'In Progress'
    },
    {
      id: 'task-4',
      description: 'Submit monthly project report',
      priority: 'High',
      deadline: '2026-06-26',
      category: 'Work',
      status: 'In Progress'
    },
    {
      id: 'task-5',
      description: 'Clean the living room and balcony',
      priority: 'Low',
      deadline: '2026-06-28',
      category: 'Personal',
      status: 'To Do'
    }
  ]);

  public travelList = signal<Travel[]>([
    {
      id: 'trv-1',
      city: 'Rome',
      country: 'Italy',
      date: '2026-09-12',
      budget: 1200,
      mainObjective: 'Visit Colosseum and Vatican'
    },
    {
      id: 'trv-2',
      city: 'Paris',
      country: 'France',
      date: '2026-10-05',
      budget: 1500,
      mainObjective: 'Visit Eiffel Tower and Louvre'
    },
    {
      id: 'trv-3',
      city: 'Barcelona',
      country: 'Spain',
      date: '2026-07-20',
      budget: 900,
      mainObjective: 'Visit Sagrada Familia and beach'
    },
    {
      id: 'trv-4',
      city: 'Tokyo',
      country: 'Japan',
      date: '2026-11-10',
      budget: 2500,
      mainObjective: 'Explore Shibuya and Kyoto temples'
    },
    {
      id: 'trv-5',
      city: 'London',
      country: 'United Kingdom',
      date: '2026-08-05',
      budget: 1400,
      mainObjective: 'Visit British Museum and London Eye'
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
