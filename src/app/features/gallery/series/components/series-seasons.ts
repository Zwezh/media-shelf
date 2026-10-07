import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe, translate } from '@ngx-translate/core';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { DetailCard } from '@msh-shared/components/detail-card/detail-card';
import type { SeriesSeason } from '../../catalog/models/title';
import { formatLabels } from '../../catalog/utils/title-display';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'msh-series-seasons',
  imports: [DetailCard, TranslatePipe],
  template: `
    <msh-detail-card headingId="series-seasons-title" titleKey="series.seasons">
      @if (rows().length > 0) {
        <div class="seasons__scroll" role="region" tabindex="0" [attr.aria-label]="'series.seasonTable' | translate">
          <table>
            <thead>
              <tr>
                <th scope="col">{{ 'series.season' | translate }}</th>
                <th scope="col">{{ 'series.releaseYear' | translate }}</th>
                <th scope="col">{{ 'series.availability' | translate }}</th>
                <th scope="col">{{ 'series.formats' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.season.seasonNumber) {
                <tr>
                  <th scope="row">
                    {{
                      (row.season.seasonNumber === 0 ? 'series.specials' : 'series.seasonNumber')
                        | translate: { number: row.season.seasonNumber }
                    }}
                  </th>
                  <td>{{ row.season.releaseYear ?? ('series.unknown' | translate) }}</td>
                  <td>{{ (row.season.isAvailable ? 'series.available' : 'series.unavailable') | translate }}</td>
                  <td>
                    @if (row.formats.length > 0) {
                      <ul>
                        @for (format of row.formats; track $index) {
                          <li>{{ format }}</li>
                        }
                      </ul>
                    } @else {
                      {{ 'series.noFormats' | translate }}
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <p>{{ 'series.noSeasons' | translate }}</p>
      }
    </msh-detail-card>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .seasons__scroll {
      max-width: 100%;
      overflow-x: auto;
    }
    .seasons__scroll:focus-visible {
      outline: var(--border-focus);
      outline-offset: var(--space-xs);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      color: var(--color-text-primary);
    }
    th,
    td {
      padding: var(--space-md);
      text-align: start;
      vertical-align: top;
      border-bottom: var(--border-subtle);
    }
    thead th {
      font: var(--text-label-md);
      color: var(--color-text-secondary);
    }
    tbody th {
      font: var(--text-label-md);
    }
    td {
      font: var(--text-body-sm);
    }
    ul {
      margin: 0;
      padding-inline-start: var(--space-base);
    }
  `,
})
export class SeriesSeasons {
  readonly seasons = input.required<readonly SeriesSeason[]>();
  private readonly settings = inject(SettingsStore);
  private readonly unknown = translate('series.unknownFormat');
  protected readonly rows = computed(() =>
    [...this.seasons()]
      .sort((a, b) => a.seasonNumber - b.seasonNumber)
      .map((season) => ({
        season,
        formats: formatLabels(
          season.isAvailable ? season.formats : [],
          this.settings.qualityOptions(),
          this.settings.extensionOptions(),
          this.unknown(),
        ),
      })),
  );
}
