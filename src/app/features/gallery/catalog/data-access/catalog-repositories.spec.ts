import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { AppError } from '@msh-core/http/app-error';
import { SERIES_REPOSITORY } from '../../series/application/series.repository';
import { HttpSeriesRepository } from '../../series/infrastructure/http-series.repository';
import { WISHLIST_REPOSITORY } from '../../wishlist/application/wishlist.repository';
import { HttpWishlistRepository } from '../../wishlist/infrastructure/http-wishlist.repository';
import { RefreshWishlistUseCase } from '../../wishlist/application/refresh-wishlist.use-case';
import { CreateWishlistFromKinopoiskUseCase } from '../../wishlist/application/create-wishlist-from-kinopoisk.use-case';
import { SaveSeriesUseCase } from '../../series/application/save-series.use-case';
import { DEFAULT_CATALOG_PARAMS } from '../models/catalog-params';
import { seriesDto, movieTitleDto, seriesDraft } from '../testing/title.fixture';
import { toTitle, toTitleWriteDto } from '../utils/title.converter';

describe.each([
  { endpoint: 'series', repository: HttpSeriesRepository },
  { endpoint: 'wishlist', repository: HttpWishlistRepository },
])('$endpoint repository', ({ endpoint, repository: repositoryType }) => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideEnvironment({ apiUrl: '/api/', production: false }),
        { provide: SERIES_REPOSITORY, useExisting: HttpSeriesRepository },
        { provide: WISHLIST_REPOSITORY, useExisting: HttpWishlistRepository },
      ],
    });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('loads paginated titles with filters and backend-supported sorting', () => {
    const repository = TestBed.inject<HttpSeriesRepository | HttpWishlistRepository>(repositoryType);
    const result = vi.fn();
    repository
      .find({ ...DEFAULT_CATALOG_PARAMS, genres: ['Drama', 'Comedy'], quality: ['1080p'], search: 'Series', key: 'kpId' })
      .subscribe(result);
    const request = TestBed.inject(HttpTestingController).expectOne(({ url }) => url === `/api/${endpoint}`);
    expect(request.request.params.get('currentPage')).toBe('0');
    expect(request.request.params.get('key')).toBe('kpId');
    expect(request.request.params.getAll('genres')).toEqual(['Drama', 'Comedy']);
    expect(request.request.params.getAll('quality')).toEqual(['1080p']);
    request.flush({ currentPage: 0, list: [seriesDto], totalCount: 1 });
    expect(result).toHaveBeenCalledWith({ currentPage: 0, media: [toTitle(seriesDto)], totalCount: 1 });
  });
  it('uses encoded item paths, sends full write DTOs, and discards delete response data', () => {
    const repository = TestBed.inject<HttpSeriesRepository | HttpWishlistRepository>(repositoryType);
    const http = TestBed.inject(HttpTestingController);
    repository.findById('title/1').subscribe();
    http.expectOne(`/api/${endpoint}/title%2F1`).flush(seriesDto);
    if (repository instanceof HttpSeriesRepository) {
      repository.create(seriesDraft()).subscribe();
      const create = http.expectOne('/api/series');
      expect(create.request.body).toEqual(toTitleWriteDto(seriesDraft()));
      create.flush(seriesDto);
      repository.update('title/1', seriesDraft()).subscribe();
      http.expectOne('/api/series/title%2F1').flush(seriesDto);
    }
    const deleted = vi.fn();
    repository.delete('title/1').subscribe(deleted);
    const remove = http.expectOne(`/api/${endpoint}/title%2F1`);
    expect(remove.request.method).toBe('DELETE');
    remove.flush(seriesDto);
    expect(deleted).toHaveBeenCalledWith(undefined);
  });
  it.each([
    [400, 'validation'],
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not-found'],
    [409, 'conflict'],
    [500, 'unexpected'],
  ])('normalizes HTTP %i to %s', (status, kind) => {
    const error = vi.fn();
    TestBed.inject<HttpSeriesRepository | HttpWishlistRepository>(repositoryType).findById('1').subscribe({ error });
    TestBed.inject(HttpTestingController)
      .expectOne(`/api/${endpoint}/1`)
      .flush({}, { status: Number(status), statusText: 'Error' });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ kind }));
    expect(error.mock.calls[0][0]).toBeInstanceOf(AppError);
  });
  it('normalizes malformed success responses to application errors', () => {
    const error = vi.fn();
    TestBed.inject<HttpSeriesRepository | HttpWishlistRepository>(repositoryType).findById('1').subscribe({ error });
    TestBed.inject(HttpTestingController)
      .expectOne(`/api/${endpoint}/1`)
      .flush({ ...seriesDto, series: null });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ kind: 'unexpected' }));
  });
});

describe('Wishlist provider operations and series save', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideEnvironment({ apiUrl: '/api', production: false }),
        { provide: SERIES_REPOSITORY, useExisting: HttpSeriesRepository },
        { provide: WISHLIST_REPOSITORY, useExisting: HttpWishlistRepository },
      ],
    });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it.each([seriesDto, movieTitleDto])('refreshes either title kind through the server operation', (dto) => {
    const result = vi.fn();
    TestBed.inject(RefreshWishlistUseCase).execute('wish/1', '123').subscribe(result);
    const request = TestBed.inject(HttpTestingController).expectOne('/api/wishlist/wish%2F1/refresh');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ kpId: '123' });
    request.flush(dto);
    expect(result).toHaveBeenCalledWith(toTitle(dto));
  });
  it('preserves validation and conflict failures from refresh without follow-up requests', () => {
    const error = vi.fn();
    TestBed.inject(RefreshWishlistUseCase).execute('1', '123').subscribe({ error });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/wishlist/1/refresh')
      .flush({ message: 'Already in library' }, { status: 409, statusText: 'Conflict' });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ kind: 'conflict', message: 'Already in library' }));
  });
  it('creates a provider-backed wishlist entry and rejects malformed returned IDs', () => {
    const operation = TestBed.inject(CreateWishlistFromKinopoiskUseCase);
    const http = TestBed.inject(HttpTestingController);
    const result = vi.fn();
    operation.execute('123').subscribe(result);
    const request = http.expectOne('/api/wishlist/from-kinopoisk');
    expect(request.request.body).toEqual({ kpId: '123' });
    request.flush({ id: 'created' });
    expect(result).toHaveBeenCalledWith('created');
    const error = vi.fn();
    operation.execute('123').subscribe({ error });
    http.expectOne('/api/wishlist/from-kinopoisk').flush({ id: 5 });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ kind: 'unexpected' }));
  });
  it('selects create or item update from the explicit save command', () => {
    const operation = TestBed.inject(SaveSeriesUseCase);
    const http = TestBed.inject(HttpTestingController);
    operation.execute({ mode: 'add', draft: seriesDraft() }).subscribe();
    const add = http.expectOne('/api/series');
    expect(add.request.method).toBe('POST');
    add.flush(seriesDto);
    operation.execute({ mode: 'edit', id: 'series-1', draft: seriesDraft() }).subscribe();
    const edit = http.expectOne('/api/series/series-1');
    expect(edit.request.method).toBe('PUT');
    edit.flush(seriesDto);
  });
});
