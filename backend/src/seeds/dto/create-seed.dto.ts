import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SeedType } from '@prisma/client';

export class CreateSeedDto {
  @IsString()
  @MaxLength(4000)
  content: string;

  /** Título é opcional — se ausente, o backend gera um a partir do conteúdo. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsEnum(SeedType)
  type?: SeedType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
