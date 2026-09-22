import { Component, input } from '@angular/core';

@Component({
  selector: 'msh-footer',
  styleUrl: './footer.scss',
  templateUrl: './footer.html',
})
export class Footer {
  readonly version = input.required<string>();
}
