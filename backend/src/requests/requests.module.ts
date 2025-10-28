import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RequestsController } from './requests.controller';
import { RequestsRepository } from './requests.repository';
import { RequestsService, REQUESTS_LOGGER } from './requests.service';
import { Logger } from '@nestjs/common';

@Module({
  imports: [AuthModule],
  controllers: [RequestsController],
  providers: [
    RequestsService,
    RequestsRepository,
    {
      provide: REQUESTS_LOGGER,
      useFactory: () => new Logger('RequestsService'),
    },
  ],
  exports: [RequestsService],
})
export class RequestsModule {}
