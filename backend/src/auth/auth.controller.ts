import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  @Get('profile')
  @UseGuards(AuthGuard)
  profile(@Req() request: Request) {
    return request.user;
  }
}
