import { Component, DestroyRef, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FLOATING_PANEL_DATA } from './floating-panel.tokens';
import { FloatingPanelRef } from './floating-panel-ref';
import { FloatingPanel } from './floating-panel';

@Component({
  selector: 'msh-test-panel-content',
  template: '<h2 id="test-panel-title">Panel</h2><p id="test-panel-description">{{ data.label }}</p>',
})
class TestPanelContent {
  readonly data = inject(FLOATING_PANEL_DATA) as { readonly label: string };
  readonly panelRef = inject<FloatingPanelRef<string>>(FloatingPanelRef);
}

@Component({ template: '' })
class TestPanelOwner {
  readonly destroyRef = inject(DestroyRef);
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
      ariaDescribedBy: 'test-panel-description',
      ariaLabelledBy: 'test-panel-title',
      data: { label: 'Dynamic panel' },
      placement: 'end',
    });
    let result: string | undefined;
    ref.closed.subscribe((value) => (result = value));

    expect(document.querySelector('msh-test-panel-content')?.textContent).toContain('Dynamic panel');
    const dialog = document.querySelector('dialog');
    expect(dialog?.classList).toContain('floating-panel--end');
    expect(dialog?.getAttribute('aria-describedby')).toBe('test-panel-description');
    expect(dialog?.getAttribute('aria-labelledby')).toBe('test-panel-title');

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

  it('positions an anchored responsive panel from its trigger', () => {
    TestBed.configureTestingModule({});
    const anchor = document.createElement('button');
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      bottom: 140,
      height: 40,
      left: 100,
      right: 300,
      top: 100,
      width: 200,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    });

    TestBed.inject(FloatingPanel).open(TestPanelContent, {
      anchor,
      data: { label: 'Sorting' },
      placement: 'anchored-responsive',
    });

    const dialog = document.querySelector<HTMLDialogElement>('dialog');
    expect(dialog?.classList).toContain('floating-panel--anchored-responsive');
    expect(dialog?.style.getPropertyValue('--floating-panel-anchor-top')).toBe('140px');
  });

  it('dismisses on external scroll without reacting to panel content scroll', () => {
    TestBed.configureTestingModule({});
    const panel = TestBed.inject(FloatingPanel);
    const ref = panel.open(TestPanelContent, {
      closeOnScroll: true,
      data: { label: 'Sorting' },
      placement: 'anchored-responsive',
    });
    let didClose = false;
    ref.closed.subscribe(() => (didClose = true));

    document.querySelector('msh-test-panel-content')?.dispatchEvent(new Event('scroll'));
    expect(didClose).toBe(false);

    document.dispatchEvent(new Event('scroll'));
    expect(didClose).toBe(true);
    expect(document.querySelector('msh-floating-panel-host')).toBeNull();
  });

  it('closes and destroys a panel when its owner is destroyed', () => {
    TestBed.configureTestingModule({});
    const owner = TestBed.createComponent(TestPanelOwner);
    let didClose = false;
    const ref = TestBed.inject(FloatingPanel).open(TestPanelContent, {
      data: { label: 'Owned panel' },
      owner: owner.componentInstance.destroyRef,
    });
    ref.closed.subscribe(() => (didClose = true));

    owner.destroy();

    expect(didClose).toBe(true);
    expect(document.querySelector('msh-floating-panel-host')).toBeNull();
  });
});
