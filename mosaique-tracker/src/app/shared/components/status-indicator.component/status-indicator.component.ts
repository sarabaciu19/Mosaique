import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-indicator.component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-indicator.component.html',
  styleUrl: './status-indicator.component.scss',
})
export class StatusIndicatorComponent {
  @Input() status: string = '';
  @Output() statusChange: EventEmitter<string> = new EventEmitter<string>();

  get statusClass(): string {
    const s = this.status.toLowerCase().replace(/\s+/g, '-'); // inlocuirea spatiilor cu cratime si transformarea in litere mici
    if (s === 'done' || s === 'seen' || s === 'read') {
      return 'status-done';
    }
    return 'status-pending';
  }

  toggleStatus(): void {
    let nextStatus = this.status;
    if (this.status === 'TO DO')
      nextStatus = 'IN PROGRESS';
    else if (this.status === 'IN PROGRESS')
      nextStatus = 'DONE';
    else if (this.status === 'DONE')
      nextStatus = 'TO DO';
    else if (this.status === 'PENDING')
      nextStatus = 'SEEN';
    else if (this.status === 'SEEN')
      nextStatus = 'PENDING';

    if (nextStatus !== this.status) {
      this.statusChange.emit(nextStatus);
    }
  }
}