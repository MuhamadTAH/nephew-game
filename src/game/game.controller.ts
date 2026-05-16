import { Controller, Post, Body, Req } from '@nestjs/common';
import { GameService } from './game.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('game')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('answer')
  @ApiOperation({ summary: 'Submit answer for current level' })
  @ApiResponse({ status: 200, description: 'Returns whether answer was correct' })
  async submitAnswer(
    @Body() body: { levelId: number; selectedOption: string },
    @Req() req: Request,
  ) {
    const profileId = req.cookies?.profile_id;
    if (!profileId) {
      return { error: 'Not logged in' };
    }
    return this.gameService.submitAnswer(
      parseInt(profileId),
      body.levelId,
      body.selectedOption,
    );
  }
}

interface Request {
  cookies: { profile_id?: string };
}