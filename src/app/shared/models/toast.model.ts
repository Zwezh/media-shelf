export type ToastType = 'info' | 'success' | 'warning' | 'error';

export type ToastId = number;

export interface ToastAction {
  readonly label: string;
  readonly handler: () => void;
}

export interface ToastOptions {
  readonly title: string;
  readonly message?: string;
  readonly type?: ToastType;
  readonly closable?: boolean;
  readonly autoHide?: boolean;
  readonly delay?: number;
  readonly action?: ToastAction;
}

export interface ToastMessage {
  readonly id: ToastId;
  readonly title: string;
  readonly message?: string;
  readonly type: ToastType;
  readonly closable: boolean;
  readonly autoHide: boolean;
  readonly delay: number;
  readonly action?: ToastAction;
}
