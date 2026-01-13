import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { QueueModule } from './queue/queue.module';
import { AiModule } from './ai/ai.module';
import { ProcessorsModule } from './processors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Priority: REDIS_URL > REDIS_HOST + REDIS_PORT + REDIS_PASSWORD
        const redisUrl =
          process.env.REDIS_URL || configService.get<string>('REDIS_URL');

        if (redisUrl) {
          // Parse Redis URL (supports redis:// and rediss:// for TLS)
          // Format: redis://:password@host:port or rediss://:password@host:port
          try {
            const url = new URL(redisUrl);
            const isTls = url.protocol === 'rediss:';
            const password = url.password || undefined;
            const host = url.hostname;
            const port = url.port
              ? parseInt(url.port, 10)
              : isTls
                ? 6380
                : 6379;

            console.log('Using Redis URL connection');
            console.log('Redis host:', host);
            console.log('Redis port:', port);
            console.log('Redis TLS:', isTls);
            console.log('Redis password:', password ? '***' : 'none');

            return {
              redis: {
                host,
                port,
                password,
                ...(isTls && {
                  tls: {
                    rejectUnauthorized: false, // Set to true in production with proper certs
                  },
                }),
              },
              defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
                attempts: 3,
                backoff: {
                  type: 'exponential',
                  delay: 5000,
                },
              },
            };
          } catch {
            throw new Error(
              `Invalid REDIS_URL format: ${redisUrl}. Expected format: redis://:password@host:port or rediss://:password@host:port`,
            );
          }
        }

        // Fallback to separate host/port/password configuration
        const redisHost =
          process.env.REDIS_HOST || configService.get<string>('REDIS_HOST');
        const redisPort = process.env.REDIS_PORT
          ? parseInt(process.env.REDIS_PORT, 10)
          : configService.get<number>('REDIS_PORT', 6379);
        const redisPassword =
          process.env.REDIS_PASSWORD ||
          configService.get<string>('REDIS_PASSWORD');
        const redisTls =
          process.env.REDIS_TLS === 'true' ||
          configService.get<string>('REDIS_TLS') === 'true';

        console.log('Using Redis host/port configuration');
        console.log('Redis host:', redisHost);
        console.log('Redis port:', redisPort);
        console.log('Redis password:', redisPassword ? '***' : 'none');
        console.log('Redis TLS:', redisTls);

        if (!redisHost) {
          throw new Error(
            'Either REDIS_URL or REDIS_HOST environment variable is required. ' +
              'For third-party Redis: Use REDIS_URL (e.g., redis://:password@host:port) ' +
              'or set REDIS_HOST, REDIS_PORT, and optionally REDIS_PASSWORD.',
          );
        }

        return {
          redis: {
            host: redisHost,
            port: redisPort,
            ...(redisPassword && { password: redisPassword }),
            ...(redisTls && {
              tls: {
                rejectUnauthorized: false, // Set to true in production with proper certs
              },
            }),
          },
          defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 50,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    QueueModule,
    AiModule,
    AuthModule,
    ContentModule,
    ProcessorsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../..', 'client', 'dist'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
