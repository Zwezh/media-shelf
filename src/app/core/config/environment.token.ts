import { InjectionToken, Provider } from '@angular/core';
import { type Environment } from '../../../environments/environment.model';

export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT');

export const provideEnvironment = (environment: Environment): Provider => ({
  provide: ENVIRONMENT,
  useValue: environment,
});
