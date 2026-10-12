import packageMetadata from '../../../../package.json';

export const REPOSITORY_URL = 'https://github.com/Zwezh/media-shelf';
export const BACKEND_REPOSITORY_URL = 'https://github.com/Zwezh/cinema-catalogue-be';
export const LEGACY_APP_URL = 'https://cinema-catalogue.web.app';
export const WINFORMS_REFERENCE_URL = 'https://news.microsoft.com/speeches/speech-transcript-anders-hejlsberg-visual-studio-net-launch/';

export const APP_HISTORY = [
  { id: 'first', number: 1, period: '2010–2011', images: [] },
  {
    id: 'second',
    number: 2,
    period: '2015–2016',
    images: [{ src: '/images/about/my-library-cinema.webp', width: 1003, height: 655, caption: 'desktop' }],
  },
  {
    id: 'third',
    number: 3,
    period: '',
    images: [
      { src: '/images/about/cinema-catalogue-gallery.webp', width: 1906, height: 921, caption: 'gallery' },
      { src: '/images/about/cinema-catalogue-details.webp', width: 1913, height: 915, caption: 'details' },
    ],
  },
  { id: 'fourth', number: 4, period: '', images: [] },
] as const;

export const CURRENT_FEATURES = [
  'collections',
  'discovery',
  'editing',
  'autofill',
  'series',
  'wishlist',
  'statistics',
  'personalization',
  'mobile',
] as const;

export const DEPENDENCY_GROUPS = [
  {
    key: 'frontend',
    items: [
      { name: 'Angular', version: packageMetadata.dependencies['@angular/core'], key: 'angular', url: 'https://angular.dev' },
      { name: 'NgRx Signals', version: packageMetadata.dependencies['@ngrx/signals'], key: 'ngrx', url: 'https://ngrx.io/guide/signals' },
      {
        name: 'ngx-translate',
        version: packageMetadata.dependencies['@ngx-translate/core'],
        key: 'translate',
        url: 'https://ngx-translate.org',
      },
      { name: 'RxJS', version: packageMetadata.dependencies.rxjs, key: 'rxjs', url: 'https://rxjs.dev' },
      {
        name: 'Angular Service Worker',
        version: packageMetadata.dependencies['@angular/service-worker'],
        key: 'worker',
        url: 'https://angular.dev/ecosystem/service-workers',
      },
    ],
  },
  {
    key: 'backend',
    items: [
      { name: 'NestJS 12 / Node.js', version: '', key: 'nestjs', url: 'https://nestjs.com' },
      { name: 'SQLite / libSQL', version: '', key: 'database', url: 'https://github.com/tursodatabase/libsql' },
      { name: 'Passport / JWT / bcrypt', version: '', key: 'auth', url: 'https://www.passportjs.org' },
    ],
  },
] as const;
