import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ToastStore } from '@msh-shared/services/toast-store';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { GalleryApi } from '../../data-access/gallery-api';
import { type MediaDto } from '../../models/media.dto';
import { KinopoiskApi } from '../data-access/kinopoisk-api';
import type { MovieAutofill } from '../models/movie-autofill.model';
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
  it('loads a raw DTO for edit mode', () => {
    const getMovieDto = vi.fn(() => of(movie));
    TestBed.configureTestingModule({
      providers: [
        MovieEditorStore,
        ...provideI18nTesting(),
        { provide: GalleryApi, useValue: { getMovieDto } },
        { provide: KinopoiskApi, useValue: {} },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: Location, useValue: { back: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: 'movie-1' })), snapshot: { data: { mode: 'edit' } } },
        },
      ],
    });

    const store = TestBed.inject(MovieEditorStore);
    expect(getMovieDto).toHaveBeenCalledWith('movie-1');
    expect(store.mode()).toBe('edit');
    expect(store.seed().name).toBe('Название');
    expect(store.breadcrumbTitle()).toBe('Название');
  });

  it('posts add-mode data, shows a toast, and navigates to the returned movie', () => {
    const addMovie = vi.fn(() => of(movie));
    const navigate = vi.fn(() => Promise.resolve(true));
    TestBed.configureTestingModule({
      providers: [
        MovieEditorStore,
        ...provideI18nTesting(),
        { provide: GalleryApi, useValue: { addMovie } },
        { provide: KinopoiskApi, useValue: {} },
        { provide: Router, useValue: { navigate } },
        { provide: Location, useValue: { back: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({})), snapshot: { data: { mode: 'add' } } },
        },
      ],
    });

    const store = TestBed.inject(MovieEditorStore);
    store.save(movie);

    expect(addMovie).toHaveBeenCalledWith(movie);
    expect(navigate).toHaveBeenCalledWith(['/gallery/movies', 'movie-1'], { queryParamsHandling: 'preserve' });
    expect(TestBed.inject(ToastStore).toasts().at(-1)).toEqual(expect.objectContaining({ title: 'Movie saved', type: 'success' }));
  });

  it('shows the duplicate-name conflict and keeps the add form in place', () => {
    const addMovie = vi.fn(() =>
      throwError(
        () =>
          new HttpErrorResponse({
            error: { error: 'Conflict', message: 'A movie with the same name already exists.', statusCode: 409 },
            status: 409,
            statusText: 'Conflict',
          }),
      ),
    );
    const navigate = vi.fn(() => Promise.resolve(true));
    TestBed.configureTestingModule({
      providers: [
        MovieEditorStore,
        ...provideI18nTesting(),
        { provide: GalleryApi, useValue: { addMovie } },
        { provide: KinopoiskApi, useValue: {} },
        { provide: Router, useValue: { navigate } },
        { provide: Location, useValue: { back: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({})), snapshot: { data: { mode: 'add' } } },
        },
      ],
    });

    const store = TestBed.inject(MovieEditorStore);
    store.save(movie);

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
    const response = new Subject<MovieAutofill>();
    TestBed.configureTestingModule({
      providers: [
        MovieEditorStore,
        ...provideI18nTesting(),
        { provide: GalleryApi, useValue: {} },
        { provide: KinopoiskApi, useValue: { getMovieAutofill: () => response.asObservable() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: Location, useValue: { back: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({})), snapshot: { data: { mode: 'add' } } },
        },
      ],
    });
    const store = TestBed.inject(MovieEditorStore);
    const currentModel = signal({ ...toMovieEditorModel(movie), extension: 'mkv', quality: 'HD' });
    store.autofill({ currentModel, id: 999 });
    currentModel.update((value) => ({ ...value, extension: 'mp4', quality: '4K' }));

    response.next({
      actors: [],
      backdropUrl: '',
      compactPosterUrl: '',
      countries: [],
      description: '',
      directors: [],
      enName: '',
      genres: [],
      kpId: 999,
      name: 'Autofilled title',
      posterUrl: '',
      sequelsAndPrequels: [],
      similarMovies: [],
    });

    expect(store.seed().extension).toBe('mp4');
    expect(store.seed().quality).toBe('4K');
    expect(store.seed().name).toBe('Autofilled title');
  });
});
