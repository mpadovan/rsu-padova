import { forwardRef, Module } from '@nestjs/common';
import { AllowedDomainsService } from './allowed-domains.service';
import { AllowedDomainsRepository } from './allowed-domains.repository';
import { AllowedDomainsController } from './allowed-domains.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [AllowedDomainsController],
  providers: [AllowedDomainsService, AllowedDomainsRepository],
  exports: [AllowedDomainsService],
})
export class AllowedDomainsModule {}
