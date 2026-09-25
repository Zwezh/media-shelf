# Floating Panels

`FloatingPanel` is the business-agnostic API for modal floating UI. It dynamically creates a native `<dialog>` container under `document.body`, attaches an arbitrary Angular component through `ViewContainerRef`, and provides typed data and a `FloatingPanelRef<TResult>` through dependency injection. Only one panel is active at a time.

```typescript
const ref = floatingPanel.open<FilterPanel, FilterData, FilterResult>(FilterPanel, {
  ariaLabelledBy: 'filter-panel-title',
  data: { filters },
  placement: 'responsive',
});

ref.closed.subscribe((result) => {
  if (result) apply(result);
});
```

```mermaid
flowchart LR
  Caller[Feature caller] -->|open component and config| Service[FloatingPanel]
  Service --> Container[Dynamic native dialog container]
  Container --> Content[Dynamic feature component]
  Data[FLOATING_PANEL_DATA] --> Content
  Ref[FloatingPanelRef] --> Content
  Content -->|close result| Ref
  Ref -->|closed observable| Caller
  Ref --> Cleanup[Detach view, destroy component, restore focus]
```

Contracts:

- `FloatingPanelConfig` controls data, accessible naming, backdrop/Escape dismissal, placement, panel classes, and focus restoration.
- Content injects `FLOATING_PANEL_DATA` and `FloatingPanelRef`; callers receive the same reference with the dynamically created component instance and a completing `closed` observable.
- Opening a second panel closes and destroys the active panel before attaching the next one.
- Native dialog modality provides top-layer rendering and prevents interaction with background content.
- Backdrop and Escape dismissal return `undefined`; an explicit result is supplied by content calling `close(result)`.
- Closing detaches the Angular view, destroys the container and its content, removes the host element, completes the result stream, and restores the previously focused element when it still exists.
- `responsive` placement is a full-height end sheet on desktop and a full-height sheet on mobile; neither mode uses a top offset.
- `anchored-responsive` accepts an `HTMLElement` anchor. It opens beneath and end-aligned with the trigger on desktop, updates its anchor coordinates on resize, and becomes a content-height modal bottom sheet with a scrim on mobile.
- Enter motion uses design motion tokens and is removed for reduced-motion preferences.

Rationale and lessons:

- Dynamic attachment belongs in one shared service so feature components remain ordinary injectable Angular components.
- The native dialog supplies semantics and modality without adding Angular CDK or duplicating its full overlay system.
- Panel content owns its header, body, footer, and result contract; the shared container owns only lifecycle and placement.

Related lodes: [UI summary](summary.md), [media gallery](media-gallery.md), [application shell](application-shell.md), [practices](../practices.md).
