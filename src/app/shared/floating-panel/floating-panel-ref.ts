import { Observable, ReplaySubject } from 'rxjs';

export class FloatingPanelRef<TResult = unknown, TComponent = unknown> {
  private readonly closedSubject = new ReplaySubject<TResult | undefined>(1);
  private closedState = false;

  readonly closed: Observable<TResult | undefined> = this.closedSubject.asObservable();
  componentInstance: TComponent | undefined;

  constructor(private readonly closePanel: (result?: TResult) => void) {}

  close(result?: TResult): void {
    if (this.closedState) return;
    this.closePanel(result);
  }

  finishClose(result?: TResult): void {
    if (this.closedState) return;
    this.closedState = true;
    this.closedSubject.next(result);
    this.closedSubject.complete();
  }
}
