export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  constructor() {
    this.envConfig = {};
    this.envConfig.auth = {
      secretKey: process.env.JWT_SECRET_KEY,
    };
    this.envConfig.serpApi = {
      secret_key: process.env.SERP_API_SECRET_KEY,
    };
    this.envConfig.service = {
      title: process.env.SERVICE_TITLE,
      description: process.env.SERVICE_DESCRIPTION,
      version: process.env.SERVICE_VERSION,
      tag: process.env.SERVICE_TAG,
    };
    this.envConfig.server = {
      port: +process.env.SERVICE_PORT || 3000,
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
    this.envConfig.reference = {
      referenceName: process.env.REFERENCE_NAME,
      url: process.env.REFERENCE_URL,
    };
    this.envConfig.woocommerce = {
      consumerKey: process.env.WOOCOMMERCE_KEY,
      consumerSecret: process.env.WOOCOMMERCE_SECRET,
      url: process.env.WOOCOMMERCE_URL,
    };
    this.envConfig.wordpress = {
      url: process.env.WOOCOMMERCE_URL,
      secret_key: process.env.JWT_SECRET_KEY,
    };
  }
  get(key: string): any {
    return this.envConfig[key];
  }
}
