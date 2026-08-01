import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TransmissionsModule } from './transmissions/transmissions.module';
import { LogEntriesModule } from './log-entries/log-entries.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TransmissionsModule,
    LogEntriesModule,
    TagsModule,
  ],
})
export class AppModule {}
