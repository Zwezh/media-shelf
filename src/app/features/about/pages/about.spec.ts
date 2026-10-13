import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { Pwa } from '@msh-core/pwa/pwa';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import polish from '../../../../../public/i18n/pl.json';
import russian from '../../../../../public/i18n/ru.json';
import { About } from './about';

describe('About', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        {
          provide: Pwa,
          useValue: {
            mobilePlatform: 'ios',
            installed: signal(false),
            canInstall: signal(false),
            installError: signal(false),
            installing: signal(false),
          },
        },
      ],
    });
  });

  it('presents all four generations, unique screenshots, source links, dependencies and installation without a backend', async () => {
    const fixture = TestBed.createComponent(About);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toBe('About MediaShelf');
    expect(element.textContent).toContain('v4.0.0');
    expect(element.querySelectorAll('.about__chapter')).toHaveLength(4);
    expect(element.querySelectorAll('figure')).toHaveLength(3);
    expect(element.querySelector('a[href="https://github.com/Zwezh/media-shelf"]')).not.toBeNull();
    expect(element.querySelector('a[href="https://cinema-catalogue.web.app"]')).not.toBeNull();
    expect(element.querySelector('#about-stack-frontend')?.textContent).toBe('Frontend');
    expect(element.querySelector('#about-stack-backend')?.textContent).toBe('Backend');
    expect(element.querySelector('msh-pwa-installation')).not.toBeNull();
    expect(element.querySelector('#about-loading-title')?.parentElement?.textContent).toContain('30–60 seconds');
    expect(element.textContent).toContain('Aleksy Zwierzyński');
    expect(element.ownerDocument.activeElement).not.toBe(element.querySelector('h1'));
  });

  it.each([
    ['pl', polish, 'O MediaShelf'],
    ['ru', russian, 'О MediaShelf'],
  ] as const)('changes the story, captions and features to %s', async (language, dictionary, heading) => {
    const fixture = TestBed.createComponent(About);
    await fixture.whenStable();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(language, dictionary);
    await firstValueFrom(translate.use(language));
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toBe(heading);
    expect(element.querySelector('figcaption')?.textContent).toBe(dictionary.about.images.desktop);
    expect(element.querySelector('.about__features li')?.textContent).toBe(dictionary.about.features.collections);
    expect(element.querySelector('summary')?.textContent).toBe(dictionary.pwa.instructions);
    expect(element.querySelector('#about-loading-title')?.textContent).toBe(dictionary.about.loadingTitle);
  });
});
