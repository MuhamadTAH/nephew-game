import { Controller, Get, Param, Post, Body, Req } from '@nestjs/common';
import { LevelsService } from './levels.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('levels')
@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all levels' })
  @ApiResponse({ status: 200, description: 'Returns all active levels' })
  async getAllLevels() {
    return this.levelsService.getAllLevels();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific level by ID' })
  @ApiResponse({ status: 200, description: 'Returns level details' })
  async getLevel(@Param('id') id: string) {
    return this.levelsService.getLevel(parseInt(id));
  }
}