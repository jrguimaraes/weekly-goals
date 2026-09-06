import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { validateEnv } from './config/env.validation.js';
import { CategoriesModule } from './categories/categories.module.js';
import { GoalsModule } from './goals/goals.module.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { WeeksModule } from './weeks/weeks.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    CategoriesModule,
    WeeksModule,
    GoalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
