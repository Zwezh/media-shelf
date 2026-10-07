import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { SaveTitleCommand } from '../../catalog/models/save-title-command';
import type { Title, TitleDraft } from '../../catalog/models/title';
import { WISHLIST_REPOSITORY } from './wishlist.repository';

@Injectable({ providedIn: 'root' })
export class SaveWishlistUseCase {
  private readonly repository = inject(WISHLIST_REPOSITORY);

  execute(command: SaveTitleCommand<TitleDraft>): Observable<Title> {
    return command.mode === 'add' ? this.repository.create(command.draft) : this.repository.update(command.id, command.draft);
  }
}
