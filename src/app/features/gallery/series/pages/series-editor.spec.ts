import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthSession } from '@msh-core/auth/auth-session';
import { SettingsStore } from '@msh-core/settings/settings.store';
import { resetTestAuthStorage, TEST_ACCESS_TOKEN } from '@msh/testing/auth-testing';
import { provideI18nTesting } from '@msh/testing/i18n-testing';
import { createSeriesEditorModel } from '../models/series-editor.model';
import { SeriesEditorStore } from '../state/series-editor.store';
import { SeriesEditorPage } from './series-editor';

async function setup(mode: 'add' | 'edit' = 'add') {
  const store = {
    seed: signal(createSeriesEditorModel()),
    mode: signal(mode),
    operation: signal('idle'),
    isBusy: signal(false),
    hasLoadError: signal(false),
    save: vi.fn(),
    autofill: vi.fn(),
    discard: vi.fn(),
  };
  const settings = {
    qualityOptions: signal([{ id: 'q1', title: 'HD', value: '720p', default: true }]),
    extensionOptions: signal([{ id: 'e1', value: 'MKV', default: true }]),
    genresForFilters: signal(['Drama']),
    settings: { hasValue: signal(true), isLoading: signal(false), error: signal(undefined) },
  };
  TestBed.configureTestingModule({
    providers: [provideRouter([]), ...provideI18nTesting(), { provide: SettingsStore, useValue: settings }],
  });
  TestBed.overrideComponent(SeriesEditorPage, { set: { providers: [{ provide: SeriesEditorStore, useValue: store }] } });
  TestBed.inject(AuthSession).start(TEST_ACCESS_TOKEN);
  const fixture = TestBed.createComponent(SeriesEditorPage);
  await fixture.whenStable();
  return { fixture, store, settings, root: fixture.nativeElement as HTMLElement };
}
function type(root: HTMLElement, selector: string, value: string): void {
  const input = root.querySelector<HTMLInputElement>(selector)!;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
function save(root: HTMLElement): void {
  root.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
}
beforeEach(resetTestAuthStorage);
afterEach(() => TestBed.resetTestingModule());
describe('SeriesEditorPage', () => {
  it('allows incomplete optional metadata but rejects a blank title with accessible focus and errors', async () => {
    const { fixture, store, root } = await setup();
    save(root);
    await fixture.whenStable();
    expect(store.save).not.toHaveBeenCalled();
    expect(root.ownerDocument.activeElement?.id).toBe('movie-editor-name');
    type(root, '#movie-editor-name', ' New Series ');
    await fixture.whenStable();
    save(root);
    await fixture.whenStable();
    expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Series', kind: 'series', rating: null, formats: [] }));
  });
  it('derives availability and the read-only quality list from single-choice season fields', async () => {
    const { fixture, store, root } = await setup();
    type(root, '#movie-editor-name', 'Series');
    root.querySelector<HTMLButtonElement>('#add-season')!.click();
    await fixture.whenStable();
    expect(root.querySelector('#available-count')).toBeNull();
    const row = root.querySelector<HTMLElement>('.seasons-editor__season')!;
    expect(row.querySelector('select')).toBeNull();
    row.querySelector<HTMLInputElement>('.seasons-editor__availability input')!.click();
    await fixture.whenStable();
    const selects = row.querySelectorAll<HTMLSelectElement>('select');
    expect(selects[0].multiple).toBe(false);
    expect(selects[0].value).toBe('');
    selects[0].value = 'q1';
    selects[0].dispatchEvent(new Event('input', { bubbles: true }));
    selects[1].value = 'e1';
    selects[1].dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(root.querySelector('.seasons-editor__count')?.textContent).toContain('1');
    const localFile = root.querySelector('#series-formats-title')!.closest('section')!;
    expect(localFile.querySelector('select')).toBeNull();
    expect(localFile.querySelector('li')?.textContent).toBe('HD');
    save(root);
    await fixture.whenStable();
    expect(store.save).toHaveBeenCalledOnce();
    expect(store.save.mock.calls[0][0]).toMatchObject({
      formats: [{ qualityId: 'q1', extensionId: 'e1' }],
      series: { seasons: [{ isAvailable: true, formats: [{ qualityId: 'q1', extensionId: 'e1' }] }] },
    });
    expect(store.save.mock.calls[0][0]).not.toHaveProperty('availableSeasonCount');
    root.querySelector<HTMLButtonElement>('.seasons-editor__season button')!.click();
    await fixture.whenStable();
    expect(root.querySelector('.seasons-editor__count')?.textContent).toContain('0');
    expect(localFile.querySelector('li')).toBeNull();
  });
  it('requires both format fields only for available seasons and retains selections when hidden', async () => {
    const { fixture, store, root } = await setup();
    type(root, '#movie-editor-name', 'Series');
    root.querySelector<HTMLButtonElement>('#add-season')!.click();
    await fixture.whenStable();
    const row = root.querySelector<HTMLElement>('.seasons-editor__season')!;
    const available = row.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    available.click();
    await fixture.whenStable();
    const selects = row.querySelectorAll<HTMLSelectElement>('select');
    expect(selects[0].required).toBe(true);
    expect(selects[1].required).toBe(true);
    save(root);
    await fixture.whenStable();
    expect(store.save).not.toHaveBeenCalled();
    expect(root.ownerDocument.activeElement).toBe(selects[0]);
    selects[0].value = 'q1';
    selects[0].dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    save(root);
    await fixture.whenStable();
    expect(store.save).not.toHaveBeenCalled();
    expect(root.ownerDocument.activeElement).toBe(selects[1]);
    available.click();
    await fixture.whenStable();
    expect(row.querySelector('select')).toBeNull();
    save(root);
    await fixture.whenStable();
    expect(store.save).toHaveBeenCalledOnce();
    available.click();
    await fixture.whenStable();
    expect(row.querySelector<HTMLSelectElement>('select')?.value).toBe('q1');
    store.save.mockClear();
    save(root);
    await fixture.whenStable();
    expect(store.save).not.toHaveBeenCalled();
    const extension = row.querySelectorAll<HTMLSelectElement>('select')[1];
    extension.value = 'e1';
    extension.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    save(root);
    await fixture.whenStable();
    expect(store.save).toHaveBeenCalledOnce();
  });
  it('excludes unchecked season selections from the quality summary and saved formats', async () => {
    const { fixture, store, root } = await setup('edit');
    store.seed.set({
      ...store.seed(),
      name: 'Series',
      seasons: [{ key: 0, seasonNumber: '1', releaseYear: '', isAvailable: true, qualityId: 'q1', extensionId: 'e1' }],
    });
    await fixture.whenStable();
    expect(root.querySelector('.series-editor__qualities li')?.textContent).toBe('HD');
    root.querySelector<HTMLInputElement>('.seasons-editor__availability input')!.click();
    await fixture.whenStable();
    expect(root.querySelector('.series-editor__qualities li')).toBeNull();
    save(root);
    await fixture.whenStable();
    expect(store.save).toHaveBeenCalledWith(
      expect.objectContaining({
        formats: [],
        series: expect.objectContaining({ seasons: [expect.objectContaining({ isAvailable: false, formats: [] })] }),
      }),
    );
  });
  it('renders autofilled rows without retaining orphaned Signal Form fields', async () => {
    const { store, fixture, root } = await setup('edit');
    const season = { key: 0, seasonNumber: '1', releaseYear: '', isAvailable: true, qualityId: 'q1', extensionId: 'e1' };
    store.seed.set({ ...store.seed(), seasons: [season] });
    await fixture.whenStable();
    store.seed.set({
      ...store.seed(),
      seasons: [
        { ...season, releaseYear: '2020' },
        { ...season, key: 1, seasonNumber: '2', releaseYear: '2021', isAvailable: false, qualityId: '', extensionId: '' },
      ],
    });
    await fixture.whenStable();
    expect(root.querySelectorAll('.seasons-editor__season')).toHaveLength(2);
    expect(root.querySelector<HTMLInputElement>('input[aria-describedby="season-year-error-0"]')?.value).toBe('2020');
    expect(root.querySelector('.series-editor__qualities li')?.textContent).toBe('HD');
  });
  it('uses current season checkboxes for the edit count and leaves quality unset on new rows', async () => {
    const { root, store, fixture } = await setup('edit');
    expect(root.ownerDocument.activeElement).toBe(root.querySelector('h1'));
    store.seed.set({
      ...store.seed(),
      seasons: [{ key: 0, seasonNumber: '1', releaseYear: '2020', isAvailable: true, qualityId: '', extensionId: '' }],
    });
    await fixture.whenStable();
    expect(root.querySelector('.seasons-editor__count')?.textContent).toContain('1');
    root.querySelector<HTMLInputElement>('.seasons-editor__availability input')!.click();
    await fixture.whenStable();
    expect(root.querySelector('.seasons-editor__count')?.textContent).toContain('0');
    expect(root.querySelector('select[multiple]')).toBeNull();
  });
});
