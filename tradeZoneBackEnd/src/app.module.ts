import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ListingsModule } from './listing/listing.module';
import { Database } from './boot/database';
import { CardsModule } from './cards/cards.modules';
import { UploadsModule } from './upload/upload.module';

@Module({
  imports: [PrismaModule, AuthModule, ProfileModule, ListingsModule, CardsModule, UploadsModule],
  controllers: [AppController],
  providers: [AppService, Database],
  exports: [Database]
})
export class AppModule {}
