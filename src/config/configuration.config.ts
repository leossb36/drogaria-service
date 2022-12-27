export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  constructor() {
    this.envConfig = {};
    this.envConfig.service = {
      title: process.env.SERVICE_TITLE,
      description: process.env.SERVICE_DESCRIPTION,
      version: process.env.SERVICE_VERSION,
      tag: process.env.SERVICE_TAG,
    };
    this.envConfig.server = {
      port: +process.env.SERVICE_PORT,
    };
    this.envConfig.api = {
      token: process.env.VETOR_API_SECRET,
      url: process.env.VETOR_API_URL,
    };
  }
  get(key: string): any {
    return this.envConfig[key];
  }
}
