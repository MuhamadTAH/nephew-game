import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { LevelsModule } from './levels/levels.module';
import { ProfileModule } from './profile/profile.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    DatabaseModule,
    AuthModule,
    GameModule,
    LevelsModule,
    ProfileModule,
  ],
})
export class AppModule {}