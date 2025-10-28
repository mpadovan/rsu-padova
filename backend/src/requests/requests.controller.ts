import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CreateRequestDto } from './dto/create-request.dto';
import {
  AnonymousRequestContext,
  RequestsService,
} from './requests.service';

@Controller('requests')
@UseGuards(AuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async create(@Body() dto: CreateRequestDto, @Req() req: any) {
    const context: AnonymousRequestContext = {
      email: req?.user?.email,
      userAgent: req?.headers?.['user-agent'],
    };

    return this.requestsService.createAnonymousRequest(dto.text, context);
  }

  @Get()
  async list() {
    return this.requestsService.listRequests();
  }
}
