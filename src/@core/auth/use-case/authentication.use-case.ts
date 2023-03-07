import { WordpressIntegration } from '@core/infra/integration/wordpress-api.Integration';
import { Injectable } from '@nestjs/common';
import { authenticationDto } from '../dto/auth.dto';
import { UserModelView } from '../mv/user.mv';

@Injectable()
export class AuthenticateUserUseCase {
  constructor(private readonly wordpressIntegration: WordpressIntegration) {}

  async execute(authData: authenticationDto): Promise<UserModelView> {
    const user = await this.wordpressIntegration.authentication(authData);

    if (!user) throw new Error('Cannot authenticate user');

    return user;
  }
}
