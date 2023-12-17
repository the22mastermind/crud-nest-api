import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateWishlistDto, EditWishlistDto } from './dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: DatabaseService) {}

  async createWishlist(userId: number, dto: CreateWishlistDto) {
    const wishlist = await this.prisma.wishlist.create({
      data: {
        userId,
        ...dto,
      },
    });
    return wishlist;
  }

  getWishlists(userId: number) {
    return this.prisma.wishlist.findMany({ where: { userId } });
  }

  getWishlistById(userId: number, wishlistId: number) {
    return this.prisma.wishlist.findFirst({
      where: { id: wishlistId, userId: userId },
    });
  }

  async editWishlistById(
    userId: number,
    wishlistId: number,
    dto: EditWishlistDto,
  ) {
    // Get the wishlist by id
    const wishlist = this.prisma.wishlist.findUnique({
      where: {
        id: wishlistId,
      },
    });

    // Check if user owns the wishlist
    if (!wishlist || (await wishlist).userId !== userId)
      throw new ForbiddenException('Access denied!');

    // Update wishlist
    const updatedWishlist = await this.prisma.wishlist.update({
      where: { id: wishlistId },
      data: { ...dto },
    });
    return updatedWishlist;
  }

  async deleteWishlistById(userId: number, wishlistId: number) {
    // Get the wishlist by id
    const wishlist = this.prisma.wishlist.findUnique({
      where: {
        id: wishlistId,
      },
    });

    // Check if user owns the wishlist
    if (!wishlist || (await wishlist).userId !== userId)
      throw new ForbiddenException('Access denied!');

    // Delete wishlist
    await this.prisma.wishlist.delete({
      where: { id: wishlistId },
    });
  }
}
