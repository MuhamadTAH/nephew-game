import { Controller, Get, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current profile' })
  @ApiResponse({ status: 200, description: 'Returns profile data' })
  async getProfile(@Req() req: Request) {
    const profileId = req.cookies?.profile_id;
    if (!profileId) {
      return { error: 'Not logged in' };
    }
    return this.profileService.getProfile(parseInt(profileId));
  }
}

interface Request {
  cookies: { profile_id?: string };
}