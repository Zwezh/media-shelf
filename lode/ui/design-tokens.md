# Global Design Tokens

Global design tokens are native CSS custom properties split into focused SCSS partials under `src/styles/tokens/` and imported through `src/styles.scss`. `DESIGN.md` remains the visual source of truth; the token set mirrors its color palette, typography hierarchy, spacing, layout sizes, radii, elevations, borders, motion timings, and z-index layers.

```scss
@use 'styles/tokens';

.poster-card {
  aspect-ratio: var(--size-poster-aspect-ratio);
  background: var(--color-surface-inset);
  border: var(--border-subtle);
  border-radius: var(--radius-lg);
  transition:
    transform var(--duration-fast) var(--easing-standard),
    box-shadow var(--duration-fast) var(--easing-standard);
}
```

```mermaid
flowchart TD
  Index[_index.scss] --> Colors[_colors.scss]
  Index --> Type[_typography.scss]
  Index --> Space[_spacing.scss]
  Index --> Sizes[_sizes.scss]
  Index --> Radii[_radii.scss]
  Index --> Borders[_borders.scss]
  Index --> Elevation[_elevation.scss]
  Index --> Motion[_motion.scss]
  Index --> Z[z-index.scss]
```

Contracts:

- Components consume semantic tokens such as `--color-surface`, `--color-primary`, `--text-body-md`, `--space-base`, `--radius-md`, and `--shadow-level-1`.
- Stitch surface roles are exposed as `--color-surface-container-lowest` through `--color-surface-container-highest`, with matching `--color-on-surface`, `--color-on-surface-variant`, `--color-outline`, and `--color-outline-variant` roles. Dense composed UI such as sorting panels uses these roles instead of approximating them with the slate surface scale.
- Shared layout components consume the Figma-aligned `--color-shell-*` and `--size-shell-*` families so feature semantics remain independent.
- Palette tokens may exist to compose color semantics, but component code should not depend on raw palette names unless it is defining a new semantic token.
- Light colors are defined on `:root, [data-theme='light']`; dark colors are defined on `[data-theme='dark']`.
- Non-color tokens are theme-neutral.
- The browser root remains 16px so rem-based spacing and sizing retain the Stitch scale. The document body uses `--text-body-md` (14px/20px) as its inherited text baseline and enables antialiased font rendering.
- `--radius-xl` is the 12px Stitch container/control tier used by popovers, bottom sheets, and prominent segmented controls; structural pill shapes remain restricted to `--radius-pill`.
- Angular Material theming is not configured in the project; there is no Material token bridge yet.

Related lodes: [UI summary](summary.md), [application shell](application-shell.md), [practices](../practices.md), [terminology](../terminology.md).
