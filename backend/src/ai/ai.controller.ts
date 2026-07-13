import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { AIService } from './ai.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('message')
  async sendMessage(@Body() dto: SendMessageDto, @CurrentUser() user: AuthenticatedUser) {
    return this.aiService.sendMessage(user.userId, dto);
  }

  @Get('history')
  async getHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query('seedId') seedId?: string,
  ) {
    return this.aiService.getHistory(user.userId, seedId);
  }
}
