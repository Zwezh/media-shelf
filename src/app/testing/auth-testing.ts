import { StorageKey } from '@msh-core/storage/storage-key';

export const TEST_ACCESS_TOKEN = 'e30.eyJleHAiOjQxMDI0NDQ4MDB9.signature';

export const resetTestAuthStorage = (): void => localStorage.removeItem(StorageKey.Token);
