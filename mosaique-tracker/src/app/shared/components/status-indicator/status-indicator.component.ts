import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-indicator',
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
    if (this.status === 'To Do')
      nextStatus = 'In Progress';
    else if (this.status === 'In Progress')
      nextStatus = 'Done';
    else if (this.status === 'Done')
      nextStatus = 'To Do';
    else if (this.status === 'Pending')
      nextStatus = 'Seen';
    else if (this.status === 'Seen')
      nextStatus = 'Pending';

    if (nextStatus !== this.status) {
      this.statusChange.emit(nextStatus);
    }
  }
}