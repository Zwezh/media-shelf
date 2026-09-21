---
name: Media Precision
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#703a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#934e00'
  on-tertiary-container: '#ffd2b1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Nunito Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Nunito Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Nunito Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Nunito Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Nunito Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  sidebar-width: 16rem
  sidebar-collapsed: 4.5rem
  inspector-width: 22rem
  gutter-grid: 1rem
---

## Brand & Style

The design system embodies a modern, architectural, and restrained desktop workspace engineered for media connoisseurs, archivists, and collectors. The interface balances high utilitarian density with understated luxury, avoiding trendy neon glow or muddy glassmorphism in favor of crisp delineation, deliberate structural framing, and calm editorial whitespace.

### Target Audience & Emotional Response
The target audience consists of dedicated cinephiles, digital collectors, and metadata perfectionists who manage substantial libraries across movies, series, physical discs, and bespoke releases. The interface instills a sense of quiet authority, permanent preservation, and tactile order. The emotional tone is decisive, reliable, and museum-grade—every asset feels cataloged with archival care.

### Design Style & Principles
- **Architectural Structure**: Interfaces prioritize crisp borders, well-calibrated dividers, and strict alignment over ambient blobs or diffuse layering.
- **Content as Foreground Artifact**: Neutral light gray canvases, cool charcoal framing, and balanced neutral surfaces serve to showcase dynamic artwork, posters, and technical flags without visual competition.
- **Calculated Density**: Desktop views support information-dense layouts (spec sheets, audio channel mappings, release hashes) without visual fatigue by employing clear tabular baselines and tight component groupings.

## Colors

The system employs a high-clarity light canvas defined by pure white panels, deliberate slate-tinted canvas backdrops, and surgical boundary rules. Color is strictly functional: structural elements rely on neutral slate and deep charcoal, while saturated hues are reserved exclusively for interactive states and canonical media status indicators.

### Palette Architecture
- **Primary Accent (`#4F46E5` / Hover `#4338CA`)**: Refined Indigo/Cobalt used for primary actions, active navigation states, selected table rows, and the canonical `Movie` taxonomy indicator.
- **Secondary Accent (`#059669`)**: Emerald green signaling episodic content, completed status, healthy disk mount status, and `Series` markers.
- **Tertiary Accent (`#D97706`)**: Warm amber highlighting items flagged under `Wishlist`, missing seasons, pending imports, or secondary alerts.
- **Ratings Accent (`#F59E0B`)**: Golden amber allocated to community scores, critic ratings, and user-starred media.
- **Technical & Quality Flags (`#475569`)**: Slate slate-600 utilized for technical specifications such as resolution badges (`4K REMUX`, `1080p`, `HDR10+`), audio codecs (`DTS-HD MA`, `Atmos`), and container profiles.
- **Restricted / Age Rating (`#E11D48`)**: Controlled rose indicating mature certificates (`NC-17`, `TV-MA`, `R`) or destructive operations.
- **Borders & Dividers (`#E2E8F0`)**: Crisp, low-noise border rule that structures the workspace without heavy tonal drops.
- **Surfaces**: 
  - Base Workspace Canvas: `#F8FAFC`
  - Elevated Container / Grid Panels: `#FFFFFF`
  - Inset Canvas / Metadata Shelves: `#F1F5F9`
  - Deep Charcoal Structural Typography: `#0F172A`
  - Secondary Metadata Text: `#64748B`

## Typography

The type scale is standardized around a 16px baseline utilizing Nunito Sans. Nunito Sans lends human legibility at dense desktop scales while retaining crisp geometric rendering in native desktop renderers.

### Type Hierarchy Guidance
- **Display & Headliners**: Used sparingly for media title views, library statistics, and primary modal headers. Display sizes utilize tighter letter-spacing (`-0.02em`) to retain muscular density.
- **Body Text**: Tuned for synopsis blocks, changelogs, and file-path listings. Body typography uses regular (400) weight to counter heavy visual weight from artwork grids.
- **Labels & Badges**: Technical labels, video format tags, and table column headers must use uppercase or small-caps letterforms in `label-sm` (11px) or `label-md` (12px) paired with bold (700) weight and tracking (`0.02em` to `0.04em`) to maintain sharp contrast against background pills.

## Layout & Spacing

The layout model is anchored by a persistent, multi-pane desktop shell with fixed structural regions and fluid internal workspaces. 

### Desktop Architecture & Multi-Pane Layout
- **Navigation Shell**: Left navigation rail spans a fixed width of `16rem` (`256px`), collapsible to `4.5rem` (`72px`) for dense viewing modes.
- **Main Canvas**: Fluid central viewport accommodating responsive card grids, dense tabular views, or wide-aspect film strip lanes.
- **Detail / Inspector Drawer**: Contextual right pane fixed at `22rem` (`352px`) that slides or docks seamlessly to show codec trees, file signatures, external database links, and audio stream toggles.
- **Poster Grid Mechanics**: Poster cards maintain a canonical `2:3` aspect ratio, auto-filling column slots with a minimum card width of `160px` and maximum width of `220px`, separated by a uniform `1rem` (`16px`) gutter.
- **Table Density**: Table rows in file management views conform to a strict `36px` or `44px` height with `0.5rem` vertical cell padding for rapid vertical scanning.

## Elevation & Depth

Visual depth is achieved through structural border framing complemented by razor-sharp, low-diffusion shadows. Large ambient blurs and semi-opaque overlays are excluded to preserve technical precision.

### Elevation Hierarchy
- **Level 0 (App Canvas)**: Surface tint `#F8FAFC`. Zero elevation, non-shadowed backdrop.
- **Level 1 (Panels, Shelves, Cards)**: Surface `#FFFFFF`, framed with a `1px` continuous border of `#E2E8F0`. Shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.05)`.
- **Level 2 (Hovered Cards, Dropdowns, Flyouts)**: Surface `#FFFFFF`, border `#CBD5E1`. Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modals, Popovers, Command Palettes)**: Surface `#FFFFFF`, border `#94A3B8`. Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05)`.
- **Level 4 (Media Overlays, Drag Ghosts)**: Solid high-contrast elevation. Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.

## Shapes

The geometric signature uses a restrained, semi-sharp radius (`rounded-md` ~6px to `rounded-lg` ~8px) across all desktop controls. This prevents toy-like roundness, keeps card edges clean against dense poster artwork, and maintains alignment with desktop operating system guidelines.

### Corner Radii Guidelines
- **Micro Elements (Checkboxes, Inline Badges, Split Tags)**: `4px` (`rounded-sm`).
- **Standard Controls (Buttons, Inputs, Select Menus, Toolbars)**: `6px` (`rounded-md`).
- **Surface Containers (Media Poster Cards, Inspector Drawers, Dialog Panels)**: `8px` (`rounded-lg`).
- **Pill Exceptions**: Circular or fully-rounded pills (`9999px`) are prohibited for structural cards, used strictly for dynamic numerical badges (such as unread badges or disc item count indicators).

## Components

### Buttons
- **Primary**: Background `#4F46E5`, hover `#4338CA`, active `#3730A3`, text `#FFFFFF`. Border: `1px solid transparent`. Padding: `8px 16px`. Radius: `6px`. Font: `label-lg`.
- **Secondary / Outline**: Background `#FFFFFF`, hover `#F8FAFC`, active `#F1F5F9`, text `#0F172A`. Border: `1px solid #E2E8F0`.
- **Ghost**: Background `transparent`, hover `#F1F5F9`, text `#475569`. Used for media action toolbars (refresh metadata, match, lock fields).
- **Destructive**: Background `#FFFFFF`, hover `#FFF1F2`, text `#E11D48`. Border: `1px solid #FECDD3`.

### Semantic Badges & Chips
Badges use high-contrast, soft-fill backgrounds paired with saturated typography and matching micro-borders:
- **Movie Badge**: Background `#EEF2FF`, border `#C7D2FE`, text `#4338CA`.
- **Series Badge**: Background `#ECFDF5`, border `#A7F3D0`, text `#047857`.
- **Wishlist Badge**: Background `#FFFBEB`, border `#FDE68A`, text `#B45309`.
- **Rating Badge**: Background `#FEF3C7`, border `#FCD34D`, text `#B45309`. Icon: Gold star indicator `#F59E0B`.
- **Quality / Codec Badges (`4K UHD`, `REMUX`, `DTS-X`)**: Background `#F1F5F9`, border `#CBD5E1`, text `#334155`. Styled in `label-sm`, monospace-adjusted tracking.
- **Age Rating (`PG-13`, `R`, `18+`)**: Background `#FFF1F2`, border `#FECDD3`, text `#BE123C`.

### Form Controls & Inputs
- **Text & Search Fields**: Background `#FFFFFF`, border `1px solid #E2E8F0`, text `#0F172A`. Focus state: `border-color: #4F46E5`, outline: `2px solid #C7D2FE`. Placeholder: `#94A3B8`. Height: `36px` (compact) or `40px` (standard).
- **Checkboxes & Radios**: Size: `16px x 16px`. Border: `1.5px solid #CBD5E1`. Checked state: background `#4F46E5` with sharp white SVG checkmark. Radius: `4px` for checkboxes, full circle for radios.

### Media Poster Cards
- Built with a rigid `2:3` aspect ratio container.
- Border: `1px solid #E2E8F0`. Background: `#F1F5F9`. Radius: `8px`.
- Image displays cover-fit with an immediate subtle inner stroke (`inset 0 0 0 1px rgba(0,0,0,0.05)`).
- Hover state: Elevation Level 2, card shifts upward by `-2px` with a transition of `150ms ease-out`, border updates to `#CBD5E1`.
- Overlay actions: Hidden by default, exposed on focus/hover via a bottom-scrim linear gradient (`rgba(15, 23, 42, 0.85)`).

### Media Spec Sheets & Metadata Lists
- Split key-value listings: Left key label styled in `label-md` (`#64748B`), right value in `body-sm` (`#0F172A`).
- Separated by hairline borders of `1px solid #F1F5F9`.
- Hover state on list rows triggers an instantaneous background transition to `#F8FAFC`.