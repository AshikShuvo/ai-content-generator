/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data
    await prismaService.user.deleteMany({
      where: {
        email: {
          in: [
            'test@example.com',
            'john.doe@example.com',
            'jane.doe@example.com',
          ],
        },
      },
    });
    await app.close();
  });

  afterEach(async () => {
    // Clean up after each test
    await prismaService.user.deleteMany({
      where: {
        email: {
          in: [
            'test@example.com',
            'john.doe@example.com',
            'jane.doe@example.com',
          ],
        },
      },
    });
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user.firstName).toBe(registerDto.firstName);
      expect(response.body.user.lastName).toBe(registerDto.lastName);
      expect(response.body.user).not.toHaveProperty('password');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('should fail with duplicate email', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      // Second registration with same email
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(409);

      expect(response.body.message).toBe('Email already exists');
    });

    it('should fail with invalid email', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body.message).toContain(
        'Please provide a valid email address',
      );
    });

    it('should fail with short password', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body.message).toContain(
        'Password must be at least 8 characters long',
      );
    });

    it('should fail with missing fields', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('First name is required'),
          expect.stringContaining('Last name is required'),
        ]),
      );
    });
  });

  describe('/api/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create a user for login tests
      const registerDto = {
        email: 'john.doe@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto);
    });

    it('should login successfully with correct credentials', async () => {
      const loginDto = {
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe(loginDto.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('should fail with incorrect password', async () => {
      const loginDto = {
        email: 'john.doe@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail with non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail with invalid email format', async () => {
      const loginDto = {
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(400);

      expect(response.body.message).toContain(
        'Please provide a valid email address',
      );
    });

    it('should fail with missing password', async () => {
      const loginDto = {
        email: 'john.doe@example.com',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(400);

      expect(response.body.message).toContain('Password is required');
    });
  });

  describe('/api/auth/me (GET)', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get token
      const registerDto = {
        email: 'jane.doe@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto);

      accessToken = response.body.access_token;
    });

    it('should return current user with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('jane.doe@example.com');
      expect(response.body.firstName).toBe('Jane');
      expect(response.body.lastName).toBe('Doe');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('should fail with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });
  });

  describe('JWT Token Validation', () => {
    it('should include valid user data in JWT payload', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      // Register
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      const { access_token, user } = registerResponse.body;

      // Use token to access protected route
      const meResponse = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200);

      // User from /me should match user from registration
      expect(meResponse.body.id).toBe(user.id);
      expect(meResponse.body.email).toBe(user.email);
      expect(meResponse.body.firstName).toBe(user.firstName);
      expect(meResponse.body.lastName).toBe(user.lastName);
    });

    it('should work with token from login as well', async () => {
      // Register
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto);

      // Login
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: registerDto.email, password: registerDto.password })
        .expect(200);

      const { access_token } = loginResponse.body;

      // Use login token to access protected route
      const meResponse = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200);

      expect(meResponse.body.email).toBe(registerDto.email);
    });
  });
});
