# Session Authentication

MediaShelf obtains a short-lived JWT by posting a secret key to the configured API's `/auth` endpoint. `AuthSession` validates that the token is a structurally valid, unexpired JWT with a numeric `exp` claim, persists it through `BrowserStorage` under `StorageKey.Token`, and restores it after reload. Invalid or expired stored tokens are removed. The backend remains responsible for signature, issuer, audience, revocation, and operation-level authorization.

```typescript
export const authenticationInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthSession).accessToken();
  return token && isMediaShelfApiRequest(request.url)
    ? next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
    : next(request);
};
```

```mermaid
flowchart LR
  Header[Header Sign In] --> Dialog[Authorization dialog]
  Dialog -->|POST secretKey| AuthAPI[/auth]
  AuthAPI -->|access_token JWT| Session[AuthSession]
  Session --> Storage[(localStorage token)]
  Storage -->|reload restore| Session
  Session --> Interceptor[Scoped Bearer interceptor]
  Interceptor --> MediaAPI[MediaShelf API]
  Interceptor -. never attaches .-> PoiskKino[PoiskKino API]
  Session --> Guard[Add/edit route guard]
  Session --> Directive[Protected-control directive]
  Expiry[JWT exp or authenticated 401] --> SignOut[Clear session]
```

## Contracts

- `POST {apiUrl}/auth` sends `{ secretKey: string }` and parses `{ access_token: string }` from `unknown`.
- The access token is persisted in `localStorage` under the centralized `StorageKey.Token` value `token`, as explicitly required by the product. This survives reloads but exposes the token to same-origin JavaScript; a future backend-issued `HttpOnly; Secure; SameSite` cookie or BFF remains the safer durable-session contract.
- A token must have three non-empty JWT segments and a future numeric `exp` claim. Client decoding schedules expiry but does not verify authenticity; every protected backend operation still validates the token server-side.
- The functional HTTP interceptor adds `Authorization: Bearer <token>` only to the normalized configured `environment.apiUrl` boundary. It excludes `/auth`, PoiskKino, translation files, image assets, and unrelated origins. An authenticated 401 clears the local session.
- The header's right corner renders Sign In while signed out and Sign Out while signed in. It does not render View Only status labels.
- Sign In opens one centered native-dialog panel based on the Stitch authorization prototype. The dialog contains a secret-key password field, visibility toggle, explanatory security hint, Cancel, and Sign In. It omits Forgot key and Remember workstation authorization.
- Successful and failed authorization attempts show localized toast feedback. Closing, Escape, backdrop dismissal, and Cancel do not authenticate.
- Add movie, card Edit/Delete, detail Edit/Delete, and editor save controls use the shared `mshRequiresAuth` directive. The directive combines session state with each control's existing busy state and applies native `disabled` semantics.
- The Add movie action includes the shared add icon and an authorization tooltip while disabled.
- `/gallery/movies/new` and `/gallery/movies/:id/edit` use a functional activation guard. Signed-out navigation returns a `UrlTree` for `/gallery/movies` while preserving collection query parameters.
- Route guards and disabled controls improve navigation and affordances only; they are never treated as authorization enforcement.

## Accessibility and lifecycle

- The dialog is labelled and described through the shared `FloatingPanel`; focus begins on the secret-key input and returns to the Sign In trigger on close.
- The password visibility control has a localized accessible name that reflects the next action.
- Native disabled controls are not keyboard-activatable, and authorization status changes update them reactively.
- Auth subscriptions are bounded by component destruction, the expiry timer is replaced on re-authentication, and service destruction clears its timer without deleting the persisted session. Sign Out, expiry, invalid restoration, and authenticated `401` responses remove both signal and stored token state.

Related lodes: [browser storage](../storage/summary.md), [application shell](../ui/application-shell.md), [floating panels](../ui/floating-panels.md), [toast notifications](../ui/toast-notifications.md), [routing](../routing/summary.md), [movie editor](../plans/movie-editor.md), [media gallery](../ui/media-gallery.md).
