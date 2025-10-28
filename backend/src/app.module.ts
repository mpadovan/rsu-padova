import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { AllowedDomainsModule } from './allowed-domains/allowed-domains.module';

@Module({
  imports: [ConfigModule, AllowedDomainsModule, AuthModule],
})
export class AppModule {}
