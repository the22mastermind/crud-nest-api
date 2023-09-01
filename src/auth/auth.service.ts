import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { DatabaseService } from 'src/database/database.service';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: DatabaseService) {}
  async signup(dto: AuthDto) {
    // Generate password
    const hash = await argon.hash(dto.password);

    try {
      // Save user in db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      delete user.hash;

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('Email already taken');
      }
      throw error;
    }
  }

  signin() {
    return { msg: 'Hello there' };
  }
}
