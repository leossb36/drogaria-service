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
      isEnabled: process.env.NODE_ENV === 'development',
      prefix: '/api',
    };
    this.envConfig.api = {
      token: process.env.VETOR_API_SECRET,
      url: process.env.VETOR_API_URL,
      prefix: process.env.VETOR_API_PREFIX_KEY,
    };
    this.envConfig.google = {
      searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
      auth: process.env.GOOGLE_API_SECRET,
    };
  }
  get(key: string): any {
    return this.envConfig[key];
  }
}
