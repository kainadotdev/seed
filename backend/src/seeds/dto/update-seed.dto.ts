import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { SeedType, SeedStatus, SeedVisibility } from '@prisma/client';

export class UpdateSeedDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  content?: string;

  @IsOptional()
  @IsEnum(SeedType)
  type?: SeedType;

  @IsOptional()
  @IsEnum(SeedStatus)
  status?: SeedStatus;

  @IsOptional()
  @IsEnum(SeedVisibility)
  visibility?: SeedVisibility;

  @IsOptional()
  @IsBoolean()
  favorite?: boolean;

  @IsOptional()
  @IsBoolean()
  archived?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
