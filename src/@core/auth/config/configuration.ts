export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  constructor() {
    this.envConfig = {};
    this.envConfig.auth = {
      secretKey: process.env.JWT_SECRET_KEY,
    };
  }
  get(key: string): any {
    return this.envConfig[key];
  }
}
