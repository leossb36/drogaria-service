import { Controller, Post, Res, UseGuards, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@common/decorators/auth.decorator';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import * as messages from '@common/messages/response-messages.json';
import { LocalAuthGuard } from '@common/guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: Request, @Res() response: Response) {
    const user = await this.authService.login(req.user);
    if (!user) {
      return response.status(404).send(messages.authentication.post.error);
    }
    return response.status(200).send({ ...user });
  }
}
