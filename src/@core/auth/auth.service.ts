import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticateUserUseCase } from './use-case/authentication.use-case';

@Injectable()
export class AuthService {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly jwtService: JwtService,
  ) {}

  async login(request: any) {
    const payload = {
      username: request.user_nicename,
      email: request.user_email,
      token: request.token,
    };

    return {
      token: payload.token,
    };
  }

  async validateUser(username: string, password: string) {
    const authenticatedUser = await this.authenticateUserUseCase.execute({
      username,
      password,
    });

    return authenticatedUser;
  }
}
