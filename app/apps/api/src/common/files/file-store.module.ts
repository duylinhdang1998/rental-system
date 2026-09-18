import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import { ENVIRONMENT } from '../../config/configuration.js';
import type { Environment } from '../../config/environment.js';
import { DiskFileStore } from './disk-file-store.js';
import { PRIVATE_FILE_STORE } from './file-store.tokens.js';
import { MemoryFileStore } from './memory-file-store.js';
import { PrivateFileController } from './private-file.controller.js';
import { SignedLinkService } from './signed-link.service.js';

function storeProvider(environment: Environment): Provider {
  if (environment.DEMO_MODE || environment.NODE_ENV === 'test') {
    return { provide: PRIVATE_FILE_STORE, useClass: MemoryFileStore };
  }
  return {
    provide: PRIVATE_FILE_STORE,
    useFactory: () => new DiskFileStore(environment.PRIVATE_FILE_DIR),
  };
}

/** Private files never get a permanent public URL (NFR-02): uploads land in the store, reads use signed links. */
@Module({})
export class FileStoreModule {
  static register(environment: Environment): DynamicModule {
    return {
      controllers: [PrivateFileController],
      exports: [PRIVATE_FILE_STORE, SignedLinkService],
      global: true,
      module: FileStoreModule,
      providers: [
        { provide: ENVIRONMENT, useValue: environment },
        storeProvider(environment),
        SignedLinkService,
      ],
    };
  }
}
