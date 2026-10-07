import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import type { TitleAutofill } from '../../catalog/models/title-autofill';
import { createEmptyMovieEditorModel } from '../../movie-editor/models/movie-editor.model';
import { AutofillMovieUseCase } from './autofill-movie.use-case';
import { TITLE_AUTOFILL_REPOSITORY } from '../../catalog/application/title-autofill.repository';
import { MOVIES_REPOSITORY } from './movies.repository';
import { SaveMovieUseCase } from './save-movie.use-case';

describe('movie application use cases', () => {
  it('selects create or update from the editor mode', () => {
    const draft = { ...createEmptyMovieEditorModel(), id: 'movie-1', name: 'Movie' };
    const create = vi.fn(() => of({ id: 'created' }));
    const update = vi.fn(() => of({ id: 'updated' }));
    TestBed.configureTestingModule({
      providers: [SaveMovieUseCase, { provide: MOVIES_REPOSITORY, useValue: { create, update } }],
    });
    const useCase = TestBed.inject(SaveMovieUseCase);

    useCase.execute('add', draft).subscribe();
    useCase.execute('edit', draft).subscribe();

    expect(create).toHaveBeenCalledWith(draft);
    expect(update).toHaveBeenCalledWith(draft);
  });

  it('merges autofill into the latest draft when the response arrives', () => {
    let draft = { ...createEmptyMovieEditorModel(), extension: 'mkv', name: 'Original' };
    const response = new Subject<TitleAutofill>();
    TestBed.configureTestingModule({
      providers: [
        AutofillMovieUseCase,
        {
          provide: TITLE_AUTOFILL_REPOSITORY,
          useValue: {
            getTitleAutofill: () => response.asObservable(),
          },
        },
      ],
    });
    let result = draft;
    TestBed.inject(AutofillMovieUseCase)
      .execute(301, () => draft)
      .subscribe((value) => (result = value));
    draft = { ...draft, extension: 'mp4' };
    response.next({
      kind: 'movie',
      series: null,
      ageRating: null,
      rating: null,
      year: null,
      releaseDate: null,
      durationMinutes: null,
      actors: [],
      backdropUrl: '',
      compactPosterUrl: '',
      countries: [],
      description: '',
      directors: [],
      originalTitle: '',
      genres: [],
      kpId: '301',
      title: 'Autofilled',
      posterUrl: '',
      sequelsAndPrequels: [],
      similarMovies: [],
    });

    expect(result.extension).toBe('mp4');
    expect(result.name).toBe('Autofilled');
  });
});
