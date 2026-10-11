import { isRecord } from '@msh-shared/utils/record';
import { Route } from '@angular/router';

export interface NavigationMetadata {
  readonly labelKey: string;
  readonly order: number;
}

export interface NavigationItem extends NavigationMetadata {
  readonly path: string;
}

const isNavigationMetadata = (value: unknown): value is NavigationMetadata => {
  if (!isRecord(value)) {
    return false;
  }

  const metadata = value;

  return typeof metadata['labelKey'] === 'string' && typeof metadata['order'] === 'number';
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
          labelKey: metadata.labelKey,
          order: metadata.order,
          path: `/${route.path}`,
        },
      ];
    })
    .sort((first, second) => first.order - second.order);
