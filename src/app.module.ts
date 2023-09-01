import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [AuthModule, UserModule, WishlistModule, DatabaseModule],
})
export class AppModule {}
