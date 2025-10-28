import { Global, Module } from '@nestjs/common';
import { firebaseProviders } from './firebase-admin.provider';

@Global()
@Module({
  providers: [...firebaseProviders],
  exports: [...firebaseProviders],
})
export class ConfigModule {}
