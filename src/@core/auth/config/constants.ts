import { ConfigService } from '@config/configuration.config';

const configService = new ConfigService();

export const jwtConstants = {
  secret: configService.get('auth').secretKey,
};
