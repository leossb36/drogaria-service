import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const domain = 'https://farmacialuita.com.br/wp-json';
    const params = {
      email,
      password,
    };

    const { data } = await lastValueFrom(
      this.httpService.post(`${domain}/jwt-auth/v1/token`, {
        params,
      }),
    );

    if (data && this.comparePassword(password, data.password)) {
      const { id, user_nicename, user_email } = data;
      return { id, user_nicename, user_email };
    } else {
      throw new HttpException('Invalid Login params!', HttpStatus.UNAUTHORIZED);
    }
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
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
