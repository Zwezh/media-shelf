import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { SettingsApi } from './settings-api';

describe('SettingsApi', () => {
  it('loads settings once and exposes sorted filter genres', async () => {
    TestBed.configureTestingModule({
      providers: [
        SettingsApi,
        provideEnvironment({ apiUrl: 'http://localhost:4200/api/', kinopoiskToken: '', production: false }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const api = TestBed.inject(SettingsApi);
    const http = TestBed.inject(HttpTestingController);
    TestBed.tick();

    http.expectOne('http://localhost:4200/api/settings').flush({
      _id: 'settings-1',
      extension: 'mkv',
      genresForFilters: ['Thriller', 'Action', 'Drama'],
      language: 'en',
      quality: '4K',
    });
    TestBed.tick();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(api.settings.value()).toEqual({
      extension: 'mkv',
      genresForFilters: ['Thriller', 'Action', 'Drama'],
      id: 'settings-1',
      quality: '4K',
    });
    expect(api.genresForFilters()).toEqual(['Action', 'Drama', 'Thriller']);
    http.verify();
  });

  it('exposes an error when the settings response is malformed', async () => {
    TestBed.configureTestingModule({
      providers: [
        SettingsApi,
        provideEnvironment({ apiUrl: 'http://localhost:4200/api/', kinopoiskToken: '', production: false }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const api = TestBed.inject(SettingsApi);
    const http = TestBed.inject(HttpTestingController);
    TestBed.tick();

    http.expectOne('http://localhost:4200/api/settings').flush({ genresForFilters: null });
    TestBed.tick();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(api.settings.error()).toBeInstanceOf(TypeError);
    expect(api.genresForFilters()).toEqual([]);
    http.verify();
  });
});
