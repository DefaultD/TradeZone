import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ProfileRepository } from './profile.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadsService } from 'src/upload/uploads.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository, PrismaService, UploadsService],
  exports: [ProfileService, UploadsService], // 🔥 exporta para ser usado no AuthService
})
export class ProfileModule { }
