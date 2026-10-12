# Application Shell

The root `App` composes standalone layout components: `Header`, `PwaStatus`, `MainContent`, and `Footer`. The host is a row grid with `auto auto minmax(0, 1fr) auto`, so short feature pages keep the footer at the viewport bottom while long pages expand normally. `MainContent` owns the application's only semantic `<main>` and primary `RouterOutlet`; routed feature pages use sections and own their internal grids and padding.

```html
<msh-header [navigationItems]="navigationItems">
  <msh-quick-search header-search />
</msh-header>
<msh-pwa-status />
<msh-main-content />
<msh-footer [version]="version" />
```

```scss
.main-content {
  display: grid;
  align-content: start;
  min-height: 100%;
}
```

```mermaid
flowchart TD
  App[App grid] --> Header[Header]
  App --> PwaStatus[Offline and update status]
  App --> Main[MainContent]
  App --> Footer[Footer]
  Routes[Root route metadata] --> Header
  Search[Gallery quick search] -->|projected slot| Header
  Header --> Auth[Sign In / Sign Out]
  Main --> Outlet[RouterOutlet]
  Package[package.json version] --> Footer
```

Contracts:

- The desktop header is 56 px high with 24 px inline padding; at 48 rem and below it is 64 px high with 16 px padding.
- The application header is sticky at the viewport top and remains above feature-level sticky navigation.
- At 640 px and below, root navigation becomes a fixed bottom bar with icons and translated labels, without an add button. The bar is 64 px tall before the bottom safe area, with a 90% shell-surface tint and backdrop blur matching the translucent detail-hero treatment. Root padding reserves the bar height plus the bottom safe area; toast placement clears it. The right-side authentication action becomes icon-only visually while retaining its translated accessible text.
- The header renders Sign In for an empty session and Sign Out for an authenticated session restored from storage when valid. Sign In dynamically imports the authorization dialog, disables its trigger while loading and reports load failures; Sign Out clears both signal and persisted token state and reports success through the global toast viewport.
- The header receives root navigation items from `App`; it does not import route configuration.
- The header exposes a `[header-search]` projection slot. `App` fills it with the Gallery-owned debounced quick search, preserving the rule that layout never imports feature logic.
- At 640 px and below, a search icon opens the projected search over the header controls. The close button or Escape hides it and restores trigger focus after rendering; opening focuses the input. Desktop keeps the inline field.
- `Gallery` remains active for `/gallery` child URLs such as `/gallery/wishlist`.
- The main content shell is full width and adds no feature padding.
- Routed components are aligned to the top of the main content shell; empty and short feature pages leave unused space below their content.
- The footer displays the product description, `Library Synced`, and the `package.json` version through `APP_VERSION`.
- Nunito Sans weights 400, 600, 700, and 800 are bundled locally through `@fontsource/nunito-sans`.
- Shell components use `--color-shell-*` and `--size-shell-*` tokens rather than hard-coded layout values.

Related lodes: [authentication](../auth/summary.md), [UI summary](summary.md), [design tokens](design-tokens.md), [quick search](quick-search.md), [routing](../routing/summary.md).

The production shell is installable and caches static resources for offline reopening. Header, footer and body respect device safe-area insets. Installation and update behavior is documented in [PWA](pwa.md).
