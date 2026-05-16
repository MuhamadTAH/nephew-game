import { Controller, Post, Body, Get, Res, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(200)
  @ApiOperation({ summary: 'Register a new profile (auto-generates numeric ID)' })
  @ApiResponse({ status: 200, description: 'Returns the generated numeric ID' })
  async register(@Res({ passthrough: true }) res: Response) {
    const { id } = await this.authService.register();
    res.cookie('profile_id', id.toString(), {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      sameSite: 'lax',
    });
    return { id };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with numeric ID' })
  @ApiResponse({ status: 200, description: 'Returns success and profile data' })
  async login(
    @Body() body: { id: number },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body.id);
    if (!result.success) {
      return { success: false, message: 'Profile not found' };
    }
    res.cookie('profile_id', body.id.toString(), {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      sameSite: 'lax',
    });
    return { success: true, profile: result.profile };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Clears the session cookie' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('profile_id');
    return { success: true };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current profile from session' })
  @ApiResponse({ status: 200, description: 'Returns profile if logged in' })
  async me(@Req() req: Request) {
    const profileId = req.cookies?.profile_id;
    if (!profileId) {
      return { loggedIn: false };
    }
    const profile = await this.authService.getProfileById(parseInt(profileId));
    return { loggedIn: true, profile };
  }
}