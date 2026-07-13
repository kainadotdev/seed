import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { SeedsService } from './seeds.service';
import { CreateSeedDto } from './dto/create-seed.dto';
import { UpdateSeedDto } from './dto/update-seed.dto';
import { TransformSeedDto } from './dto/transform-seed.dto';
import { CreateCommentDto } from './dto/comment.dto';

@Controller('seeds')
@UseGuards(JwtAuthGuard)
export class SeedsController {
  constructor(private readonly seedsService: SeedsService) {}

  // Rotas estáticas precisam vir antes de ":id" para não serem capturadas por ele.
  @Get('public')
  async findPublicFeed() {
    return this.seedsService.findPublicFeed();
  }

  @Get('saved')
  async listSaved(@CurrentUser() user: AuthenticatedUser) {
    return this.seedsService.listSaved(user.userId);
  }

  @Get('search')
  async search(@CurrentUser() user: AuthenticatedUser, @Query('q') q = '') {
    return this.seedsService.search(user.userId, q);
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('includeArchived') includeArchived?: string,
  ) {
    return this.seedsService.findAllForUser(user.userId, includeArchived === 'true');
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.seedsService.findOne(id, user.userId);
  }

  @Get(':id/related')
  async related(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.seedsService.related(id, user.userId);
  }

  @Get(':id/comments')
  async listComments(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.seedsService.listComments(id, user.userId);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.seedsService.addComment(id, user.userId, dto.content);
  }

  @Post(':id/save')
  async save(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.seedsService.saveSeed(id, user.userId);
  }

  @Delete(':id/save')
  async unsave(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.seedsService.unsaveSeed(id, user.userId);
  }

  @Post(':id/transform')
  async transform(
    @Param('id') id: string,
    @Body() dto: TransformSeedDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.seedsService.transform(id, user.userId, dto.type);
  }

  @Post()
  async create(@Body() dto: CreateSeedDto, @CurrentUser() user: AuthenticatedUser) {
    return this.seedsService.create(user.userId, dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSeedDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.seedsService.update(id, user.userId, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.seedsService.remove(id, user.userId);
  }
}
