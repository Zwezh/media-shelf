import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { DEFAULT_CATALOG_PARAMS } from '../../catalog/models/catalog-params';
import { SeriesApiClient } from './series-api.client';

it('sends Series status and availability filters in the server query', () => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideEnvironment({ apiUrl: '/api', production: false })],
  });
  TestBed.inject(SeriesApiClient)
    .find({ ...DEFAULT_CATALOG_PARAMS, productionStatus: 'finished', seasonAvailability: 'incomplete' })
    .subscribe();
  const http = TestBed.inject(HttpTestingController);
  const request = http.expectOne((req) => req.url === '/api/series');
  expect(request.request.params.get('productionStatus')).toBe('finished');
  expect(request.request.params.get('seasonAvailability')).toBe('incomplete');
  request.flush({ list: [], totalCount: 0, currentPage: 0 });
  http.verify();
});
