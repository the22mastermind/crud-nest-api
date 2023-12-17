import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateWishlistDto, EditWishlistDto } from 'src/wishlist/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let database: DatabaseService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    database = app.get(DatabaseService);
    await database.cleanDB();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'hello@example.com',
      password: 'Hello@123',
    };
    describe('SignUp', () => {
      it('should throw an error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('should throw an error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should throw an error if email and password are empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('SignIn', () => {
      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get My User Profile', () => {
      it('should get current user profile', () => {
        return pactum
          .spec()
          .get('/users/profile')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .expectStatus(200);
      });
    });

    describe('Edit User', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Jane',
          email: 'jane@example.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Wishlist', () => {
    describe('Get empty Wishlists', () => {
      it('should get empty wishlists', () => {
        return pactum
          .spec()
          .get('/wishlists')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create Wishlist', () => {
      const dto: CreateWishlistDto = {
        title: 'Computers',
        link: 'https://www.amazon.com/s?i=specialty-aps&bbn=16225007011&rh=n%3A16225007011%2Cn%3A13896617011&ref=nav_em__nav_desktop_sa_intl_computers_tablets_0_2_6_4',
      };
      it('should create a wishlist', () => {
        return pactum
          .spec()
          .post('/wishlists')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('wishlistId', 'id');
      });
    });

    describe('Get Wishlists', () => {
      it('should get wishlists', () => {
        return pactum
          .spec()
          .get('/wishlists')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Wishlist By ID', () => {
      it('should get wishlist by ID', () => {
        return pactum
          .spec()
          .get('/wishlists/{id}')
          .withPathParams('id', '$S{wishlistId}')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .expectStatus(200)
          .expectBodyContains(`$S{wishlistId}`);
      });
    });
    describe('Edit Wishlist By ID', () => {
      const dto: EditWishlistDto = {
        title: 'Computers & Tablets',
        description: 'Computers & Tablets Description',
      };
      it('should edit the wishlist by ID', () => {
        return pactum
          .spec()
          .patch('/wishlists/{id}')
          .withPathParams('id', '$S{wishlistId}')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(`$S{wishlistId}`)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete Wishlist By ID', () => {
      it('should delete the wishlist by ID', () => {
        return pactum
          .spec()
          .delete('/wishlists/{id}')
          .withPathParams('id', '$S{wishlistId}')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .expectStatus(204);
      });

      it('should get empty wishlists after deletion', () => {
        return pactum
          .spec()
          .get('/wishlists')
          .withHeaders({
            Authorization: `Bearer $S{userAt}`,
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
