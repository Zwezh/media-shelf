import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideEnvironment } from '@msh-core/config/environment.token';
import { SettingsRepository } from './settings.repository';

describe('SettingsRepository', () => {
  it('loads settings once and exposes filter options and defaults', async () => {
    TestBed.configureTestingModule({
      providers: [
        SettingsRepository,
        provideEnvironment({ apiUrl: 'http://localhost:4200/api/', kinopoiskToken: '', production: false }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const api = TestBed.inject(SettingsRepository);
    const http = TestBed.inject(HttpTestingController);
    TestBed.tick();

    http.expectOne('http://localhost:4200/api/settings').flush({
      _id: 'settings-1',
      extension: [{ value: 'MP4' }, { value: 'MKV', default: true }],
      genresForFilters: ['Thriller', 'Action', 'Drama'],
      quality: [
        { title: '2160p 4K', value: '2160p' },
        { title: '1080p FHD', value: '1080p', default: true },
      ],
    });
    TestBed.tick();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(api.settings.value()).toEqual({
      extension: [{ value: 'MP4' }, { value: 'MKV', default: true }],
      genresForFilters: ['Thriller', 'Action', 'Drama'],
      id: 'settings-1',
      quality: [
        { title: '2160p 4K', value: '2160p' },
        { title: '1080p FHD', value: '1080p', default: true },
      ],
    });
    expect(api.extensionOptions()).toEqual([{ value: 'MP4' }, { value: 'MKV', default: true }]);
    expect(api.genresForFilters()).toEqual(['Action', 'Drama', 'Thriller']);
    expect(api.qualityOptions()).toEqual([
      { title: '2160p 4K', value: '2160p' },
      { title: '1080p FHD', value: '1080p', default: true },
    ]);
    expect(api.defaultExtension()).toBe('MKV');
    expect(api.defaultQuality()).toBe('1080p');
    http.verify();
  });

  it('exposes an error when the settings response is malformed', async () => {
    TestBed.configureTestingModule({
      providers: [
        SettingsRepository,
        provideEnvironment({ apiUrl: 'http://localhost:4200/api/', kinopoiskToken: '', production: false }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const api = TestBed.inject(SettingsRepository);
    const http = TestBed.inject(HttpTestingController);
    TestBed.tick();

    http.expectOne('http://localhost:4200/api/settings').flush({ genresForFilters: null });
    TestBed.tick();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(api.settings.error()).toBeInstanceOf(TypeError);
    expect(api.genresForFilters()).toEqual([]);
    http.verify();
  });

  it('rejects malformed nested settings options', async () => {
    TestBed.configureTestingModule({
      providers: [
        SettingsRepository,
        provideEnvironment({ apiUrl: 'http://localhost:4200/api/', kinopoiskToken: '', production: false }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const api = TestBed.inject(SettingsRepository);
    const http = TestBed.inject(HttpTestingController);
    TestBed.tick();

    http.expectOne('http://localhost:4200/api/settings').flush({
      _id: 'settings-1',
      extension: [{ value: 'MKV', default: 'yes' }],
      genresForFilters: [],
      quality: [],
    });
    TestBed.tick();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(api.settings.error()).toBeInstanceOf(TypeError);
    expect(api.extensionOptions()).toEqual([]);
    expect(api.defaultExtension()).toBe('');
    http.verify();
  });
});
