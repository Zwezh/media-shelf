import { Route } from '@angular/router';

export interface NavigationMetadata {
  readonly label: string;
  readonly order: number;
}

export interface NavigationItem extends NavigationMetadata {
  readonly path: string;
}

const isNavigationMetadata = (value: unknown): value is NavigationMetadata => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const metadata = value as Record<string, unknown>;

  return typeof metadata['label'] === 'string' && typeof metadata['order'] === 'number';
};

export const createNavigationItems = (routes: readonly Route[]): readonly NavigationItem[] =>
  routes
    .flatMap((route): NavigationItem[] => {
      const metadata: unknown = route.data?.['navigation'];

      if (!route.path || route.path === '**' || !isNavigationMetadata(metadata)) {
        return [];
      }

      return [
        {
          label: metadata.label,
          order: metadata.order,
          path: `/${route.path}`,
        },
      ];
    })
    .sort((first, second) => first.order - second.order);
