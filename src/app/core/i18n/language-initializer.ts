import { inject } from '@angular/core';
import { Language } from './language';

export { SUPPORTED_LANGUAGES } from './language';

export const languageInitializer = (): Promise<unknown> => inject(Language).initialize();
