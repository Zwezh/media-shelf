import { DOCUMENT } from '@angular/common';
import { inject, Service } from '@angular/core';
import { StorageKey } from './storage-key';

@Service()
export class BrowserStorage {
  private readonly document = inject(DOCUMENT);

  get(key: StorageKey): string | undefined {
    try {
      return this.document.defaultView?.localStorage.getItem(key) ?? undefined;
    } catch {
      return undefined;
    }
  }

  set(key: StorageKey, value: string): void {
    try {
      this.document.defaultView?.localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable in restricted or privacy-focused browser contexts.
    }
  }

  remove(key: StorageKey): void {
    try {
      this.document.defaultView?.localStorage.removeItem(key);
    } catch {
      // Removal is best-effort when browser storage is unavailable.
    }
  }
}
