import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { SaveTitleCommand } from '../../catalog/models/save-title-command';
import type { SeriesTitle, SeriesDraft } from '../../catalog/models/title';
import { SERIES_REPOSITORY } from './series.repository';

@Injectable({ providedIn: 'root' })
export class SaveSeriesUseCase {
  private readonly repository = inject(SERIES_REPOSITORY);

  execute(command: SaveTitleCommand<SeriesDraft>): Observable<SeriesTitle> {
    return command.mode === 'add' ? this.repository.create(command.draft) : this.repository.update(command.id, command.draft);
  }
}
