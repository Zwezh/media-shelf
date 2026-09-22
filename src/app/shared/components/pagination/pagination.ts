import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'msh-pagination',
  styleUrl: './pagination.scss',
  templateUrl: './pagination.html',
})
export class Pagination {
  readonly page = input(1);
  readonly pageSize = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  protected readonly visiblePages = computed<readonly (number | 'ellipsis')[]>(() => {
    const total = this.totalPages();
    if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
    const current = this.page();
    if (current <= 3) {
      return [1, 2, 3, 'ellipsis', total];
    }
    if (current >= total - 2) {
      return [1, 'ellipsis', total - 2, total - 1, total];
    }
    return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
  });

  protected selectPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.page()) {
      this.pageChange.emit(page);
    }
  }
}
