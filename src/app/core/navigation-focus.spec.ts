import { TestBed } from '@angular/core/testing';
import { NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { NavigationFocus } from './navigation-focus';

describe('NavigationFocus', () => {
  it('focuses headings without scrolling only after keyboard forward navigation', () => {
    const events = new Subject<NavigationStart>();
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: { events } }] });
    const navigation = TestBed.inject(NavigationFocus);
    const heading = document.createElement('h1');
    const focus = vi.spyOn(heading, 'focus');

    events.next(new NavigationStart(1, '/gallery'));
    navigation.heading(heading);
    expect(focus).not.toHaveBeenCalled();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    events.next(new NavigationStart(2, '/gallery/series/1'));
    navigation.heading(heading);
    expect(focus).toHaveBeenCalledExactlyOnceWith({ preventScroll: true });
    navigation.heading(heading);
    expect(focus).toHaveBeenCalledOnce();

    focus.mockClear();
    events.next(new NavigationStart(3, '/gallery', 'popstate', { navigationId: 1 }));
    navigation.heading(heading);
    expect(focus).not.toHaveBeenCalled();

    document.dispatchEvent(new Event('pointerdown'));
    events.next(new NavigationStart(4, '/gallery/series/2'));
    navigation.heading(heading);
    expect(focus).not.toHaveBeenCalled();
  });
});
