import {
    Controller,
    Get,
    Put,
    Body,
    UseGuards,
    Query,
    Param,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ProfileDto } from './dto/profile.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly service: ProfileService) { }

    /**
     * Retorna o perfil do usuário autenticado.
     * GET /profile
     */
    @Get('getProfile')
    async getProfile(
        @CurrentUser() user: any,
        @Query('user_id') userId?: string,
    ) {
        const targetId = userId ? Number(userId) : user.id;
        return this.service.getProfile(targetId);
    }

    @Get(":id")
    async getUserProfile(@Param("id") id: string) {
        return this.service.getUserProfile(Number(id));
    }

    /**
     * Atualiza os dados do perfil (bio, avatar, etc.)
     * PUT /profile
     */
    @Put('updateProfile')
    async updateProfile(@CurrentUser() user: any, @Body() dto: ProfileDto) {
        if (dto.date_of_birth) {
            dto.date_of_birth = new Date(dto.date_of_birth);
        }

        return this.service.updateProfile(user.id, dto);
    }
}
