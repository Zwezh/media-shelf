import { GalleryFeedback } from '../../catalog/ui/gallery-feedback';
import { movieTitleDto } from '../../catalog/testing/title.fixture';
import { toTitle } from '../../catalog/utils/title.converter';
import { BehaviorSubject } from 'rxjs';
import { GetWishlistTitleQuery } from '../../wishlist/application/get-wishlist-title.query';
import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { map, of, Subject, throwError } from 'rxjs';
import { AppError } from '@msh-core/http/app-error';
import { ToastStore } from '@msh-shared/services/toast-store';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { type MediaDto } from '../../models/media.dto';
import { AutofillMovieUseCase } from '../../movies/application/autofill-movie.use-case';
import { LoadMovieEditorQuery } from '../../movies/application/load-movie-editor.query';
import { SaveMovieUseCase } from '../../movies/application/save-movie.use-case';
import type { TitleAutofill } from '../../catalog/models/title-autofill';
import { MovieEditorStore } from './movie-editor.store';
import { toMovieEditorModel } from '../utils/movie-editor.converter';

const movie: MediaDto = {
  addedDate: '2025-01-01',
  actors: [],
  ageRating: 12,
  backdropUrl: '',
  compactPosterUrl: '/compact.jpg',
  countries: [],
  description: '',
  director: [],
  enName: 'Original',
  extension: 'mkv',
  genres: ['Drama'],
  id: 'movie-1',
  isSeries: false,
  kpId: 1,
  movieLength: 120,
  name: 'Название',
  posterUrl: '/poster.jpg',
  quality: '4K',
  rating: 8,
  sequelsAndPrequels: [],
  similarMovies: [],
  year: 2025,
};

describe('MovieEditorStore', () => {
  it('loads an editor model for edit mode', () => {
    const loadMovie = vi.fn(() => of(toMovieEditorModel(movie)));
    TestBed.configureTestingModule({
      providers: [
        { provide: GetWishlistTitleQuery, useValue: { execute: vi.fn() } },
        MovieEditorStore,
        ...provideI18nTesting(),
        { provide: AutofillMovieUseCase, useValue: { execute: vi.fn() } },
        { provide: LoadMovieEditorQuery, useValue: { execute: loadMovie } },
        { provide: SaveMovieUseCase, useValue: { execute: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: Location, useValue: { back: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: 'movie-1' })), snapshot: { data: { mode: 'edit' } } },
        },
      ],
    });

    const store = TestBed.inject(MovieEditorStore);
    expect(loadMovie).toHaveBeenCalledWith('movie-1');
    expect(store.mode()).toBe('edit');
    expect(store.seed().name).toBe('Название');
    expect(store.breadcrumbTitle()).toBe('Название');
  });

  it('posts add-mode data, shows a toast, and navigates to the returned movie', () => {
    const saveMovie = vi.fn(() => of({ id: movie.id }));
    const navigate = vi.fn(() => Promise.resolve(true));
    TestBed.configureTestingModule({
      providers: [
        { provide: GetWishlistTitleQuery, useValue: { execute: vi.fn() } },
        MovieEditorStore,
        ...provideI18nTesting(),
        { provide: AutofillMovieUseCase, useValue: { execute: vi.fn() } },
        { provide: LoadMovieEditorQuery, useValue: { execute: vi.fn() } },
        { provide: SaveMovieUseCase, useValue: { execute: saveMovie } },
        { provide: Router, useValue: { navigate } },
        { provide: Location, useValue: { back: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})), paramMap: of(convertToParamMap({})), snapshot: { data: { mode: 'add' } } },
        },
      ],
    });

    const store = TestBed.inject(MovieEditorStore);
    const draft = toMovieEditorModel(movie);
    store.save(draft);

    expect(saveMovie).toHaveBeenCalledWith('add', draft);
    expect(navigate).toHaveBeenCalledWith(['/gallery/movies', 'movie-1'], { queryParamsHandling: 'preserve' });
    expect(TestBed.inject(ToastStore).toasts().at(-1)).toEqual(expect.objectContaining({ title: 'Movie saved', type: 'success' }));
  });

  it('shows the duplicate-name conflict and keeps the add form in place', () => {
    const saveMovie = vi.fn(() => throwError(() => new AppError('conflict', 'A movie with the same name already exists.')));
    const navigate = vi.fn(() => Promise.resolve(true));
    TestBed.configureTestingModule({
      providers: [
        { provide: GetWishlistTitleQuery, useValue: { execute: vi.fn() } },
        MovieEditorStore,
        ...provideI18nTesting(),
        { provide: AutofillMovieUseCase, useValue: { execute: vi.fn() } },
        { provide: LoadMovieEditorQuery, useValue: { execute: vi.fn() } },
        { provide: SaveMovieUseCase, useValue: { execute: saveMovie } },
        { provide: Router, useValue: { navigate } },
        { provide: Location, useValue: { back: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})), paramMap: of(convertToParamMap({})), snapshot: { data: { mode: 'add' } } },
        },
      ],
    });

    const store = TestBed.inject(MovieEditorStore);
    store.save(toMovieEditorModel(movie));

    expect(store.isSaving()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(TestBed.inject(ToastStore).toasts().at(-1)).toEqual(
      expect.objectContaining({
        message: 'A movie with the same name already exists.',
        title: 'Movie already exists',
        type: 'error',
      }),
    );
  });

  it('merges delayed autofill data into the latest editor draft', () => {
    const response = new Subject<TitleAutofill>();
    TestBed.configureTestingModule({
      providers: [
        { provide: GetWishlistTitleQuery, useValue: { execute: vi.fn() } },
        MovieEditorStore,
        ...provideI18nTesting(),
        {
          provide: AutofillMovieUseCase,
          useValue: {
            execute: (_id: number, currentModel: () => ReturnType<typeof toMovieEditorModel>) =>
              response.pipe(map((autofill) => ({ ...currentModel(), name: autofill.title }))),
          },
        },
        { provide: LoadMovieEditorQuery, useValue: { execute: vi.fn() } },
        { provide: SaveMovieUseCase, useValue: { execute: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: Location, useValue: { back: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})), paramMap: of(convertToParamMap({})), snapshot: { data: { mode: 'add' } } },
        },
      ],
    });
    const store = TestBed.inject(MovieEditorStore);
    const currentModel = signal({ ...toMovieEditorModel(movie), extension: 'mkv', quality: 'HD' });
    store.autofill({ currentModel, id: 999 });
    currentModel.update((value) => ({ ...value, extension: 'mp4', quality: '4K' }));

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
      kpId: '999',
      title: 'Autofilled title',
      posterUrl: '',
      sequelsAndPrequels: [],
      similarMovies: [],
    });

    expect(store.seed().extension).toBe('mp4');
    expect(store.seed().quality).toBe('4K');
    expect(store.seed().name).toBe('Autofilled title');
  });

  it('rejects overlapping editor operations while a save is pending', () => {
    const saveResponse = new Subject<{ id: string }>();
    const save = vi.fn(() => saveResponse.asObservable());
    const autofill = vi.fn(() => of(toMovieEditorModel(movie)));
    TestBed.configureTestingModule({
      providers: [
        { provide: GetWishlistTitleQuery, useValue: { execute: vi.fn() } },
        MovieEditorStore,
        ...provideI18nTesting(),
        { provide: AutofillMovieUseCase, useValue: { execute: autofill } },
        { provide: LoadMovieEditorQuery, useValue: { execute: vi.fn() } },
        { provide: SaveMovieUseCase, useValue: { execute: save } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: Location, useValue: { back: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({})), paramMap: of(convertToParamMap({})), snapshot: { data: { mode: 'add' } } },
        },
      ],
    });
    const store = TestBed.inject(MovieEditorStore);
    const currentModel = signal(toMovieEditorModel(movie));

    store.save(currentModel());
    store.autofill({ currentModel, id: 999 });

    expect(store.isSaving()).toBe(true);
    expect(store.isBusy()).toBe(true);
    expect(save).toHaveBeenCalledOnce();
    expect(autofill).not.toHaveBeenCalled();
  });
});

it('loads a reload-safe Wishlist source into the movie creation editor and submits source identity', () => {
  const source = toTitle({ ...movieTitleDto, id: 'wishlist-movie', name: 'Wishlisted movie', rating: null, movieLength: null });
  const params = new BehaviorSubject(convertToParamMap({ wishlistId: source.id }));
  const execute = vi.fn(() => of(source));
  const save = vi.fn(() => of({ id: source.id }));
  TestBed.configureTestingModule({
    providers: [
      MovieEditorStore,
      { provide: ActivatedRoute, useValue: { snapshot: { data: { mode: 'add' } }, queryParamMap: params } },
      { provide: GetWishlistTitleQuery, useValue: { execute } },
      { provide: SaveMovieUseCase, useValue: { execute: save } },
      { provide: AutofillMovieUseCase, useValue: { execute: vi.fn() } },
      { provide: LoadMovieEditorQuery, useValue: { execute: vi.fn() } },
      { provide: GalleryFeedback, useValue: { success: vi.fn(), error: vi.fn() } },
      { provide: Location, useValue: { back: vi.fn() } },
      { provide: Router, useValue: { navigate: vi.fn() } },
    ],
  });
  const store = TestBed.inject(MovieEditorStore);
  expect(execute).toHaveBeenCalledWith(source.id);
  expect(store.seed().name).toBe('Wishlisted movie');
  expect(store.seed().rating).toBe('');
  expect(store.seed().movieLength).toBe('');
  store.save(store.seed());
  expect(save).toHaveBeenCalledWith('add', store.seed(), source.id);
  const pendingSave = new Subject<{ id: string }>();
  save.mockReturnValueOnce(pendingSave);
  store.save(store.seed());
  params.next(convertToParamMap({}));
  pendingSave.next({ id: source.id });
  expect(TestBed.inject(Router).navigate).toHaveBeenCalledTimes(1);
  expect(store.wishlistId()).toBe('');
  expect(store.seed().name).toBe('');
});
