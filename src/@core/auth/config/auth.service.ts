import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';

@Injectable()
export class AuthService {
  constructor(
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.woocommerceIntegration.getUserByEmail(email);
    if (user && this.comparePassword(password, user.password)) {
      const { id, name, email } = user;
      return { id, name, email };
    } else {
      throw new HttpException('Invalid Login params!', HttpStatus.UNAUTHORIZED);
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async comparePassword(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  }
}
