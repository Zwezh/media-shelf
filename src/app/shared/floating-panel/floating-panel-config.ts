export type FloatingPanelPlacement = 'anchored-responsive' | 'center' | 'end' | 'responsive';

export type FloatingPanelConfig<TData = unknown> = {
  readonly anchor?: HTMLElement;
  readonly ariaLabel?: string;
  readonly ariaLabelledBy?: string;
  readonly closeOnBackdrop?: boolean;
  readonly closeOnEscape?: boolean;
  readonly closeOnScroll?: boolean;
  readonly data?: TData;
  readonly panelClass?: string | readonly string[];
  readonly placement?: FloatingPanelPlacement;
  readonly restoreFocus?: boolean;
};
