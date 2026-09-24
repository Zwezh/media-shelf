import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FLOATING_PANEL_DATA } from './floating-panel.tokens';
import { FloatingPanelRef } from './floating-panel-ref';
import { FloatingPanel } from './floating-panel';

@Component({
  selector: 'msh-test-panel-content',
  template: '<p>{{ data.label }}</p>',
})
class TestPanelContent {
  readonly data = inject(FLOATING_PANEL_DATA) as { readonly label: string };
  readonly panelRef = inject<FloatingPanelRef<string>>(FloatingPanelRef);
}

describe('FloatingPanel', () => {
  afterEach(() => {
    document.querySelectorAll('msh-floating-panel-host').forEach((host) => host.remove());
    TestBed.resetTestingModule();
  });

  it('dynamically attaches content with data and returns a close result', () => {
    TestBed.configureTestingModule({});
    const panel = TestBed.inject(FloatingPanel);
    const ref = panel.open<TestPanelContent, { readonly label: string }, string>(TestPanelContent, {
      data: { label: 'Dynamic panel' },
      placement: 'end',
    });
    let result: string | undefined;
    ref.closed.subscribe((value) => (result = value));

    expect(document.querySelector('msh-test-panel-content')?.textContent).toContain('Dynamic panel');
    expect(document.querySelector('dialog')?.classList).toContain('floating-panel--end');

    ref.componentInstance?.panelRef.close('applied');

    expect(result).toBe('applied');
    expect(document.querySelector('msh-floating-panel-host')).toBeNull();
  });

  it('dismisses on a backdrop click and restores focus', () => {
    TestBed.configureTestingModule({});
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const ref = TestBed.inject(FloatingPanel).open(TestPanelContent, { data: { label: 'Filters' } });
    let didClose = false;
    ref.closed.subscribe(() => (didClose = true));

    document.querySelector('dialog')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

    expect(didClose).toBe(true);
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});
