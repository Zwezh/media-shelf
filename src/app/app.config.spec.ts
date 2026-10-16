import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { appConfig } from './app.config';
import { AuthSession } from '@msh-core/auth/auth-session';
import { ENVIRONMENT } from '@msh-core/config/environment.token';
import { TEST_ACCESS_TOKEN } from './testing/auth-testing';

describe('application startup', () => {
  it('completes initialization while refresh is pending and restores the session later', async () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    const status = TestBed.inject(ApplicationInitStatus);
    const http = TestBed.inject(HttpTestingController);
    const apiUrl = TestBed.inject(ENVIRONMENT).apiUrl.replace(/\/$/, '');
    const request = http.expectOne(`${apiUrl}/auth/refresh`);

    http.match((request) => request.url.startsWith('./i18n/')).forEach((request) => request.flush({}));
    await status.donePromise;

    expect(status.done).toBe(true);
    expect(request.cancelled).toBe(false);
    expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(false);
    request.flush({ access_token: TEST_ACCESS_TOKEN });
    await vi.waitFor(() => expect(TestBed.inject(AuthSession).isAuthenticated()).toBe(true));
    http.verify();
  });
});
