# Internationalization

MediaShelf uses ngx-translate v18 with its HTTP loader. English, Russian, and Polish dictionaries live at `public/i18n/<lang>.json` and have identical nested key structures. `languageInitializer` registers supported languages, prefers the supported language persisted under `StorageKey.Language`, otherwise selects a supported browser language or English, persists the selection, synchronizes the document `lang` attribute, and waits for the selected dictionary before application startup completes.

```typescript
export const languageInitializer = (): Promise<unknown> => {
  const translate = inject(TranslateService);
  const browserLanguage = translate.getBrowserLang()?.split('-')[0];
  const language = isSupportedLanguage(browserLanguage) ? browserLanguage : 'en';
  return firstValueFrom(translate.use(language));
};
```

```mermaid
flowchart LR
  Storage[Stored language] --> Initializer[languageInitializer]
  Browser[Browser language fallback] --> Initializer
  Initializer -->|en, ru, pl| Loader[HTTP translation loader]
  Initializer -->|unsupported or absent| English[English fallback]
  Loader --> Dictionaries[public/i18n JSON]
  Dictionaries --> Pipes[Translate pipes/functions]
  Pipes --> UI[Visible copy and accessible labels]
  Dictionaries --> Titles[Translated TitleStrategy]
```

Invariants:

- Supported runtime languages are exactly `en`, `ru`, and `pl`; English is the fallback.
- The exact `language` localStorage key comes from `StorageKey.Language`; a supported persisted value takes precedence over browser detection.
- The header language selector binds each option's `selected` property to `Language.language()`, so browser-detected and persisted languages appear correctly on first render. Binding only the select's `value` before its `@for` options exist makes the browser display the first option (English) despite the initialized language.
- Translation files use nested contextual keys and preserve the same leaf-key set in every language.
- Visible interface copy, accessibility labels, navigation labels, and route document titles use translation keys.
- API content remains source data. List cards and Movie/Series/Wishlist detail breadcrumbs select `title` (API `name`) for Russian and `originalTitle` (API `enName`) for English/Polish, falling back to the other nonempty name. The shared `displayTitle(media, language)` helper runs inside computed signals, so language changes update visible and accessible card titles without refetching. Directors and genres remain untranslated.
- Route metadata stores title and navigation translation keys; `TranslatedTitleStrategy` resolves document titles.
- Shared components accept semantic translation keys when their copy is supplied by a feature.
- Shared form-validation translations provide specific copy for required, parsing, email, pattern, min/max, date, length, range, and schema validation kinds; feature validator messages override these defaults.
- Tests use an in-memory English loader and verify dictionary key parity.

Related lodes: [browser storage](../storage/summary.md), [project summary](../summary.md), [practices](../practices.md), [routing](../routing/summary.md), [media gallery](../ui/media-gallery.md).
