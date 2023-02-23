import { ConfigService } from './configuration';

const configService = new ConfigService();

export const jwtConstants = {
  secret: configService.get('auth').secretKey,
};
