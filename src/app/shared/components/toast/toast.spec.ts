import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastMessage, ToastType } from '@msh-shared/models/toast.model';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { Toast } from './toast';

describe('Toast', () => {
  let fixture: ComponentFixture<Toast>;

  const createToast = (overrides: Partial<ToastMessage> = {}): ToastMessage => ({
    id: 1,
    title: 'Media indexed',
    message: '42.8 TB total volume indexed',
    type: 'info',
    closable: true,
    autoHide: false,
    delay: 500,
    ...overrides,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Toast], providers: provideI18nTesting() }).compileComponents();
    fixture = TestBed.createComponent(Toast);
  });

  it.each([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'alert'],
    ['error', 'alert'],
  ] satisfies readonly [ToastType, string][])('renders the %s palette with the %s role', (type, role) => {
    fixture.componentRef.setInput('toast', createToast({ type }));
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement.querySelector('.toast');
    expect(element.classList.contains(`toast--${type}`)).toBe(true);
    expect(element.getAttribute('role')).toBe(role);
  });

  it('emits a dismissal from the close button', () => {
    const dismissed: number[] = [];
    fixture.componentInstance.dismissed.subscribe((id) => dismissed.push(id));
    fixture.componentRef.setInput('toast', createToast({ id: 7 }));
    fixture.detectChanges();

    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('.toast__close');
    expect(closeButton.getAttribute('aria-label')).toBe('Dismiss notification');
    closeButton.click();

    expect(dismissed).toEqual([7]);
  });

  it('omits controls for a non-closable toast without an action', () => {
    fixture.componentRef.setInput('toast', createToast({ closable: false }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('renders and emits the optional action', () => {
    const requested: number[] = [];
    fixture.componentInstance.actionRequested.subscribe((id) => requested.push(id));
    fixture.componentRef.setInput('toast', createToast({ id: 3, action: { label: 'View log', handler: () => undefined } }));
    fixture.detectChanges();

    const action: HTMLButtonElement = fixture.nativeElement.querySelector('.toast__action');
    expect(action.textContent?.trim()).toBe('View log');
    action.click();
    expect(requested).toEqual([3]);
  });
});
