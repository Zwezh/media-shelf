import { TestBed } from '@angular/core/testing';
import { FLOATING_PANEL_DATA } from '@msh-shared/floating-panel/floating-panel.tokens';
import { FloatingPanelRef } from '@msh-shared/floating-panel/floating-panel-ref';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { ConfirmationDialog, type ConfirmationDialogData } from './confirmation-dialog';

describe('ConfirmationDialog', () => {
  it('renders the target and returns an explicit confirmation result', async () => {
    const close = vi.fn();
    const data: ConfirmationDialogData = {
      cancelKey: 'common.cancel',
      confirmKey: 'movieDetails.delete.confirm',
      messageKey: 'movieDetails.delete.message',
      messageParams: { title: 'Movie title' },
      titleKey: 'movieDetails.delete.title',
    };
    TestBed.configureTestingModule({
      providers: [
        ...provideI18nTesting(),
        { provide: FLOATING_PANEL_DATA, useValue: data },
        { provide: FloatingPanelRef, useValue: { close } },
      ],
    });
    const fixture = TestBed.createComponent(ConfirmationDialog);

    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const buttons = element.querySelectorAll<HTMLButtonElement>('button');
    expect(element.querySelector('h2')?.textContent).toContain('Delete this movie?');
    expect(element.querySelector('p')?.textContent).toContain('Movie title');
    expect(document.activeElement).toBe(buttons[0]);

    buttons[1]?.click();
    expect(close).toHaveBeenCalledWith(true);
  });
});
