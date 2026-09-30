import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  DOCUMENT,
  EnvironmentInjector,
  inject,
  Injector,
  Service,
  Type,
} from '@angular/core';
import { FloatingPanelConfig } from './floating-panel-config';
import { FloatingPanelContainer } from './floating-panel-container';
import { FloatingPanelRef } from './floating-panel-ref';
import { FLOATING_PANEL_DATA } from './floating-panel.tokens';

@Service()
export class FloatingPanel {
  private readonly applicationRef = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);
  private activePanel: FloatingPanelRef<unknown, unknown> | undefined;

  open<TComponent, TData = unknown, TResult = unknown>(
    component: Type<TComponent>,
    config: FloatingPanelConfig<TData> = {},
  ): FloatingPanelRef<TResult, TComponent> {
    this.activePanel?.close();

    const previousFocus = this.document.activeElement instanceof HTMLElement ? this.document.activeElement : undefined;
    const host = this.document.createElement('msh-floating-panel-host');
    this.document.body.append(host);

    const containerRef = createComponent(FloatingPanelContainer, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
    });
    this.applicationRef.attachView(containerRef.hostView);
    this.configureContainer(containerRef, config);
    containerRef.changeDetectorRef.detectChanges();

    let finished = false;
    let removeScrollListener = (): void => undefined;
    let unregisterOwnerDestroy = (): void => undefined;
    const panelRef = new FloatingPanelRef<TResult, TComponent>((result) => {
      if (finished) return;
      finished = true;
      removeScrollListener();
      unregisterOwnerDestroy();
      containerRef.instance.hide();
      this.applicationRef.detachView(containerRef.hostView);
      containerRef.destroy();
      host.remove();
      panelRef.finishClose(result);
      if (this.activePanel === panelRef) this.activePanel = undefined;
      if (config.restoreFocus !== false && previousFocus?.isConnected) previousFocus.focus();
    });

    const contentInjector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: FLOATING_PANEL_DATA, useValue: config.data },
        { provide: FloatingPanelRef, useValue: panelRef },
      ],
    });
    panelRef.componentInstance = containerRef.instance.attach(component, contentInjector, this.environmentInjector);
    unregisterOwnerDestroy = config.owner?.onDestroy(() => panelRef.close()) ?? unregisterOwnerDestroy;
    containerRef.instance.dismissed.subscribe(() => panelRef.close());
    containerRef.changeDetectorRef.detectChanges();
    containerRef.instance.show();
    if (config.closeOnScroll) {
      const handleScroll = (event: Event): void => {
        const target = event.target;
        if (target instanceof Node && host.contains(target)) return;
        panelRef.close();
      };
      this.document.addEventListener('scroll', handleScroll, true);
      removeScrollListener = (): void => this.document.removeEventListener('scroll', handleScroll, true);
    }
    this.activePanel = panelRef as FloatingPanelRef<unknown, unknown>;

    return panelRef;
  }

  private configureContainer<TData>(containerRef: ComponentRef<FloatingPanelContainer>, config: FloatingPanelConfig<TData>): void {
    const panelClass = typeof config.panelClass === 'string' ? [config.panelClass] : (config.panelClass ?? []);
    containerRef.setInput('anchor', config.anchor);
    containerRef.setInput('ariaDescribedBy', config.ariaDescribedBy ?? '');
    containerRef.setInput('ariaLabel', config.ariaLabel ?? '');
    containerRef.setInput('ariaLabelledBy', config.ariaLabelledBy ?? '');
    containerRef.setInput('closeOnBackdrop', config.closeOnBackdrop ?? true);
    containerRef.setInput('closeOnEscape', config.closeOnEscape ?? true);
    containerRef.setInput('panelClass', panelClass);
    containerRef.setInput('placement', config.placement ?? 'center');
  }
}
