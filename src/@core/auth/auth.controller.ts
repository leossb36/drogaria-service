import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { AuthService } from './config/auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
