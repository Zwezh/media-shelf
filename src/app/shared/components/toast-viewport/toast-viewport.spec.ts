import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastStore } from '@msh-shared/services/toast-store';
import { ToastViewport } from './toast-viewport';

describe('ToastViewport', () => {
  let fixture: ComponentFixture<ToastViewport>;
  let store: ToastStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ToastViewport] }).compileComponents();
    fixture = TestBed.createComponent(ToastViewport);
    store = TestBed.inject(ToastStore);
    fixture.detectChanges();
  });

  afterEach(() => store.clear());

  it('renders newer toasts at the bottom of the stack', async () => {
    store.info({ title: 'First' });
    store.success({ title: 'Newest' });
    await fixture.whenStable();

    const titles = [...fixture.nativeElement.querySelectorAll('.toast__title')].map((element: HTMLElement) => element.textContent?.trim());
    expect(titles).toEqual(['First', 'Newest']);
  });

  it('removes a toast through its close control', async () => {
    store.info({ title: 'Dismiss me' });
    await fixture.whenStable();

    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('.toast__close');
    closeButton.click();
    await fixture.whenStable();

    expect(store.toasts()).toHaveLength(0);
  });
});
