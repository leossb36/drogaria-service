export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  constructor() {
    this.envConfig = {};
    this.envConfig.mongo = {
      db: process.env.MONGO_DATABASE,
      user: process.env.MONGO_USER,
      host: process.env.MONGO_HOST,
      password: process.env.MONGO_PASSWORD,
    };
    this.envConfig.mysql = {
      db: process.env.MYSQL_DB,
      user: process.env.MYSQL_USER,
      host: process.env.MYSQL_HOST,
      password: process.env.MYSQL_PASSWORD,
    };
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
