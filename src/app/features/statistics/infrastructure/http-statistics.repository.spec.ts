import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { HttpStatisticsRepository } from './http-statistics.repository';
import { emptyStatistics } from '../testing/statistics.fixture';
beforeEach(() =>
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideEnvironment({ production: false, apiUrl: '/api' })],
  }),
);
afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
  TestBed.resetTestingModule();
});
it('loads only the persisted endpoint and calculates only on explicit POST', () => {
  const repo = TestBed.inject(HttpStatisticsRepository),
    http = TestBed.inject(HttpTestingController);
  repo.getSnapshot().subscribe((value) => expect(value).toBeNull());
  http.expectOne('/api/statistics').flush({ snapshot: null });
  repo.scan().subscribe((value) => expect(value).toEqual(emptyStatistics));
  const request = http.expectOne('/api/statistics/scan');
  expect(request.request.method).toBe('POST');
  expect(request.request.body).toEqual({});
  request.flush({ snapshot: emptyStatistics });
});
it('normalizes scan errors', () => {
  TestBed.inject(HttpStatisticsRepository)
    .scan()
    .subscribe({ error: (error: unknown) => expect(error).toMatchObject({ kind: 'unauthorized' }) });
  TestBed.inject(HttpTestingController).expectOne('/api/statistics/scan').flush({}, { status: 401, statusText: 'Unauthorized' });
});
