import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { WishlistService } from './wishlist.service';
import { GetUser } from '../auth/decorator';
import { CreateWishlistDto, EditWishlistDto } from './dto';

@UseGuards(JwtGuard)
@Controller('wishlists')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post()
  createWishlist(
    @GetUser('id') userId: number,
    @Body() dto: CreateWishlistDto,
  ) {
    return this.wishlistService.createWishlist(userId, dto);
  }

  @Get()
  getWishlists(@GetUser('id') userId: number) {
    return this.wishlistService.getWishlists(userId);
  }

  @Get(':id')
  getWishlistById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) wishlistId: number,
  ) {
    return this.wishlistService.getWishlistById(userId, wishlistId);
  }

  @Patch(':id')
  editWishlistById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) wishlistId: number,
    @Body() dto: EditWishlistDto,
  ) {
    return this.wishlistService.editWishlistById(userId, wishlistId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteWishlistById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) wishlistId: number,
  ) {
    return this.wishlistService.deleteWishlistById(userId, wishlistId);
  }
}
