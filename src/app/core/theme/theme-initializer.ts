import { inject } from '@angular/core';
import { Theme } from './theme';

export const themeInitializer = (): void => inject(Theme).initialize();
