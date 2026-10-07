import { SettingsStore } from '@msh-core/settings/settings.store';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { GalleryFeedback } from '../../catalog/ui/gallery-feedback';
import { AutofillTitleUseCase } from '../../catalog/application/autofill-title.use-case';
import type { SeriesDraft, SeriesTitle } from '../../catalog/models/title';
import { seriesDto } from '../../catalog/testing/title.fixture';
import { toTitle } from '../../catalog/utils/title.converter';
import { GetSeriesTitleQuery } from '../application/get-series-title.query';
import { SaveSeriesUseCase } from '../application/save-series.use-case';
import { toSeriesDraft } from '../utils/series-editor.converter';
import { SeriesEditorStore } from './series-editor.store';

const title = toTitle(seriesDto);
function setup(mode = 'edit', defaults = true) {
  const params = new BehaviorSubject(convertToParamMap({ id: title.id }));
  const read = vi.fn(() => of(title));
  const save = vi.fn((_command: unknown) => of(title));
  const autofill = vi.fn((_id: string, latest: () => SeriesDraft) => of(latest()));
  const navigate = vi.fn(() => Promise.resolve(true));
  const feedback = { success: vi.fn(), error: vi.fn() };
  TestBed.configureTestingModule({
    providers: [
      SeriesEditorStore,
      {
        provide: SettingsStore,
        useValue: {
          qualityOptions: () => [{ id: 'default-quality', default: defaults }],
          extensionOptions: () => [{ id: 'default-extension', default: defaults }],
        },
      },
      { provide: ActivatedRoute, useValue: { snapshot: { data: { mode } }, paramMap: params } },
      { provide: Router, useValue: { navigate } },
      { provide: GalleryFeedback, useValue: feedback },
      { provide: GetSeriesTitleQuery, useValue: { execute: read } },
      { provide: SaveSeriesUseCase, useValue: { execute: save } },
      { provide: AutofillTitleUseCase, useValue: { execute: autofill } },
    ],
  });
  return { store: TestBed.inject(SeriesEditorStore), read, save, autofill, navigate, feedback, params };
}
afterEach(() => TestBed.resetTestingModule());
describe('SeriesEditorStore', () => {
  it('cancels stale edit reads and loads season availability', () => {
    const { store, read, params } = setup();
    expect(store.seed().seasons.filter((season) => season.isAvailable)).toHaveLength(1);
    const stale = new Subject<SeriesTitle>();
    read.mockReturnValueOnce(stale);
    params.next(convertToParamMap({ id: 'second' }));
    params.next(convertToParamMap({ id: 'third' }));
    stale.next({ ...title, title: 'Stale' });
    expect(store.seed().name).toBe('Series');
    expect(store.id()).toBe('third');
  });
  it('sends complete edit commands once and navigates only after success', () => {
    const { store, save, navigate } = setup();
    const pending = new Subject<SeriesTitle>();
    save.mockReturnValueOnce(pending);
    const draft = toSeriesDraft(store.seed());
    store.save(draft);
    store.save(draft);
    expect(save).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith({ mode: 'edit', id: title.id, draft });
    expect(navigate).not.toHaveBeenCalled();
    pending.next(title);
    expect(navigate).toHaveBeenCalledWith(['/gallery/series', title.id], { queryParamsHandling: 'preserve' });
    expect(store.isBusy()).toBe(false);
  });
  it('retains the draft and current screen on save error, and sends add commands without response-only data', () => {
    const { store, save, navigate, feedback } = setup('add');
    save.mockReturnValueOnce(throwError(() => new Error('offline')));
    const seed = store.seed();
    const draft = { ...toSeriesDraft(seed), title: 'New' };
    store.save(draft);
    expect(save).toHaveBeenCalledWith({ mode: 'add', draft });
    expect(store.seed()).toBe(seed);
    expect(store.isBusy()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(feedback.error).toHaveBeenCalled();
  });
  it.each([true, false])('initializes new autofilled seasons using configured defaults (%s) and keeps existing choices', (defaults) => {
    const { store, autofill } = setup('edit', defaults);
    const model = store.seed();
    const draft = toSeriesDraft(model);
    autofill.mockReturnValueOnce(
      of({
        ...draft,
        series: {
          ...draft.series,
          seasons: [...draft.series.seasons, { seasonNumber: 2, releaseYear: 2022, isAvailable: false, formats: [] }],
        },
      }),
    );
    store.autofill({ id: '1', currentModel: () => model });
    expect(store.seed().seasons.slice(0, 2)).toEqual(model.seasons);
    expect(store.seed().seasons[2]).toMatchObject({
      seasonNumber: '2',
      releaseYear: '2022',
      isAvailable: true,
      qualityId: defaults ? 'default-quality' : '',
      extensionId: defaults ? 'default-extension' : '',
    });
    const initialized = store.seed();
    autofill.mockReturnValueOnce(of(toSeriesDraft(initialized)));
    store.autofill({ id: '1', currentModel: () => initialized });
    expect(store.seed().seasons).toEqual(initialized.seasons);
  });
  it('merges autofill into the latest draft and preserves manually entered availability', () => {
    const { store, autofill } = setup('add');
    const pending = new Subject<SeriesDraft>();
    let readLatest = (): SeriesDraft => {
      throw new Error('Autofill not started');
    };
    autofill.mockImplementationOnce((_id, latest) => {
      readLatest = latest;
      return pending;
    });
    let model = { ...store.seed(), name: 'First' };
    store.autofill({ id: '1', currentModel: () => model });
    model = { ...model, name: 'Latest' };
    pending.next({ ...toSeriesDraft(model), title: 'Filled' });
    expect(readLatest()).toEqual(expect.objectContaining({ title: 'Latest' }));
    expect(store.seed().name).toBe('Filled');
    expect(store.seed().seasons).toEqual(model.seasons);
  });
});
