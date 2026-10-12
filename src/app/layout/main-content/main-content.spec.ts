import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NavigationEnd, NavigationStart, provideRouter, Router, RouterOutlet, Scroll } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { Subject } from 'rxjs';
import { MainContent } from './main-content';

describe('MainContent', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('restores Back scroll after asynchronous content grows, and cancels on user interaction', async () => {
    const events = new Subject<NavigationStart | Scroll>();
    let resize = (): void => undefined;
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resize = callback;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    vi.spyOn(TestBed.inject(Router), 'events', 'get').mockReturnValue(events);
    const scroll = vi.spyOn(TestBed.inject(ViewportScroller), 'scrollToPosition').mockImplementation(() => undefined);
    const height = vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(0);
    const fixture = TestBed.createComponent(MainContent);
    await fixture.whenStable();

    const back = new Scroll(new NavigationEnd(2, '/gallery', '/gallery'), [0, 800], null);
    events.next(back);
    expect(scroll).not.toHaveBeenCalled();
    height.mockReturnValue(window.innerHeight + 1000);
    resize();
    expect(scroll).toHaveBeenCalledExactlyOnceWith([0, 800], { behavior: 'instant' });
    resize();
    expect(scroll).toHaveBeenCalledOnce();

    scroll.mockClear();
    height.mockReturnValue(0);
    events.next(back);
    fixture.nativeElement.dispatchEvent(new Event('touchstart'));
    height.mockReturnValue(window.innerHeight + 1000);
    resize();
    expect(scroll).not.toHaveBeenCalled();

    height.mockReturnValue(0);
    events.next(back);
    events.next(new NavigationStart(3, '/about'));
    height.mockReturnValue(window.innerHeight + 1000);
    resize();
    expect(scroll).not.toHaveBeenCalled();
    fixture.destroy();
    expect(disconnect).toHaveBeenCalledOnce();
  });
  it('renders the primary router outlet inside main', async () => {
    await TestBed.configureTestingModule({
      imports: [MainContent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(MainContent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('main')).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(RouterOutlet))).not.toBeNull();
  });
});
