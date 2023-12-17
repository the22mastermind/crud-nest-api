import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// import { DatabaseService } from 'src/database/database.service';
import { DatabaseService } from '../database/database.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: DatabaseService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    // Generate hash password
    const hash = await argon.hash(dto.password);
    try {
      // Save user in db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('Email already taken');
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    try {
      // Find user by email
      const user = this.prisma.user.findUnique({ where: { email: dto.email } });
      // If user not found throw exception
      if (!user) throw new ForbiddenException('Credentials incorrect');
      // Compare passwords, if password incorrect throw exception
      const passwordMatch = await argon.verify((await user).hash, dto.password);
      if (!passwordMatch) throw new ForbiddenException('Credentials incorrect');
      return this.signToken((await user).id, (await user).email);
    } catch (error) {
      throw error;
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });
    return {
      access_token: token,
    };
  }
}
