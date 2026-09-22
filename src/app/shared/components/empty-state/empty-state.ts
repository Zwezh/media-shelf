import { Component, input } from '@angular/core';

@Component({
  selector: 'msh-empty-state',
  styleUrl: './empty-state.scss',
  templateUrl: './empty-state.html',
})
export class EmptyState {
  readonly message = input.required<string>();
}
