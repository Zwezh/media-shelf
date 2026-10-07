export type SaveTitleCommand<TDraft> =
  { readonly mode: 'add'; readonly draft: TDraft } | { readonly mode: 'edit'; readonly id: string; readonly draft: TDraft };
