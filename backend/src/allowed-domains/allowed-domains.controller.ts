import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AllowedDomainsService } from './allowed-domains.service';
import { CreateAllowedDomainDto } from './dto/create-allowed-domain.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('allowed-domains')
@UseGuards(AuthGuard)
export class AllowedDomainsController {
  constructor(private readonly service: AllowedDomainsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateAllowedDomainDto) {
    return this.service.create(dto.domain);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateAllowedDomainDto) {
    return this.service.update(id, dto.domain);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
