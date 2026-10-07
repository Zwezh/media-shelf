import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { AuthSession } from '@msh-core/auth/auth-session';
import { authenticationInterceptor } from '@msh-core/auth/authentication-interceptor';
import { resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { AutofillMovieUseCase } from '../../../movies/application/autofill-movie.use-case';
import { createEmptyMovieEditorModel } from '../../../movie-editor/models/movie-editor.model';
import { AutofillTitleUseCase } from '../../application/autofill-title.use-case';
import { TITLE_AUTOFILL_REPOSITORY } from '../../application/title-autofill.repository';
import { toTitleAutofill } from '../../data-access/title-autofill.parser';
import { titleAutofillDto } from '../../testing/title-autofill.fixture';
import { seriesDto, seriesDraft } from '../../testing/title.fixture';
import { HttpSeriesRepository } from '../../../series/infrastructure/http-series.repository';
import { HttpTitleAutofillRepository } from './http-title-autofill.repository';

describe('Title autofill backend contract', () => {
  beforeEach(() => {
    resetTestAuthStorage();
    TestBed.configureTestingModule({
      providers: [
        provideEnvironment({ apiUrl: '/api/', production: false }),
        provideHttpClient(withInterceptors([authenticationInterceptor])),
        provideHttpClientTesting(),
        { provide: TITLE_AUTOFILL_REPOSITORY, useExisting: HttpTitleAutofillRepository },
      ],
    });
    TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('requests normalized title metadata with user JWT and no provider header', () => {
    const result = vi.fn();
    TestBed.inject(HttpTitleAutofillRepository).getTitleAutofill('301').subscribe(result);
    const request = TestBed.inject(HttpTestingController).expectOne('/api/kinopoisk/titles/301/autofill');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${TEST_ACCESS_TOKEN}`);
    expect(request.request.headers.has('X-API-KEY')).toBe(false);
    request.flush({ ...titleAutofillDto, token: 'ignored', availableSeasonCount: 99 });
    expect(result).toHaveBeenCalledWith(toTitleAutofill(titleAutofillDto));
    expect(result.mock.calls[0][0]).not.toHaveProperty('token');
  });
  it('merges autofill and submits the exact normalized series write DTO', () => {
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(AutofillTitleUseCase)
      .execute('301', seriesDraft)
      .subscribe((draft) => TestBed.inject(HttpSeriesRepository).create(draft).subscribe());
    http.expectOne('/api/kinopoisk/titles/301/autofill').flush({
      ...titleAutofillDto,
      series: { ...titleAutofillDto.series, seasons: [{ seasonNumber: 2, releaseYear: 2024 }] },
    });
    const save = http.expectOne('/api/series');
    expect(save.request.method).toBe('POST');
    expect(save.request.body).toMatchObject({
      kind: 'series',
      kpId: '301',
      name: 'Imported series',
      movieLength: 45,
      director: ['Director'],
      releaseDate: '2020-03-15',
      series: {
        announcedSeasonCount: 3,
        seasons: expect.arrayContaining([{ seasonNumber: 2, releaseYear: 2024, isAvailable: false, formats: [] }]),
      },
    });
    expect(save.request.body).not.toHaveProperty('id');
    expect(save.request.body).not.toHaveProperty('availableSeasonCount');
    save.flush(seriesDto);
  });
  it('autofills the movie editor through the same title endpoint and retains local choices', () => {
    const draft = { ...createEmptyMovieEditorModel(), quality: '4K', extension: 'mkv' };
    const result = vi.fn();
    TestBed.inject(AutofillMovieUseCase)
      .execute(301, () => draft)
      .subscribe(result);
    TestBed.inject(HttpTestingController)
      .expectOne('/api/kinopoisk/titles/301/autofill')
      .flush({
        ...titleAutofillDto,
        kind: 'movie',
        series: null,
        year: [2020, 2024],
      });
    expect(result).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Imported series',
        kpId: '301',
        ageRating: '0',
        rating: '0',
        movieLength: '45',
        year: '2020, 2024',
        quality: '4K',
        extension: 'mkv',
      }),
    );
  });
  it('rejects series metadata in the movie editor without applying a result', () => {
    const next = vi.fn();
    const error = vi.fn();
    TestBed.inject(AutofillMovieUseCase).execute(301, createEmptyMovieEditorModel).subscribe({ next, error });
    TestBed.inject(HttpTestingController).expectOne('/api/kinopoisk/titles/301/autofill').flush(titleAutofillDto);
    expect(next).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ kind: 'validation' }));
  });
  it.each([
    { kpId: '302' },
    { kpId: 301 },
    { kind: undefined },
    { kind: 'movie' },
    { rating: 11 },
    { year: [2020, null] },
    { releaseDate: '2020-02-30' },
    { series: null },
    { directors: [{}] },
    { series: { ...titleAutofillDto.series, seasons: [{ seasonNumber: -1, releaseYear: null }] } },
  ])('rejects malformed or mismatched title metadata: %j', (fields) => {
    const error = vi.fn();
    TestBed.inject(HttpTitleAutofillRepository).getTitleAutofill('301').subscribe({ error });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/kinopoisk/titles/301/autofill')
      .flush({ ...titleAutofillDto, ...fields });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ kind: 'unexpected' }));
  });
  it.each([400, 404, 502, 503, 504])('retains the user session on backend %i', (status) => {
    const error = vi.fn();
    TestBed.inject(HttpTitleAutofillRepository).getTitleAutofill('301').subscribe({ error });
    TestBed.inject(HttpTestingController).expectOne('/api/kinopoisk/titles/301/autofill').flush({}, { status, statusText: 'Failure' });
    expect(error).toHaveBeenCalled();
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(true);
  });
  it('clears the session when the backend rejects the JWT', () => {
    const error = vi.fn();
    TestBed.inject(HttpTitleAutofillRepository).getTitleAutofill('301').subscribe({ error });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/kinopoisk/titles/301/autofill')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ kind: 'unauthorized' }));
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(false);
  });
});
