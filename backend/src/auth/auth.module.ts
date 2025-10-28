import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AllowedDomainsModule } from '../allowed-domains/allowed-domains.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [forwardRef(() => AllowedDomainsModule)],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
