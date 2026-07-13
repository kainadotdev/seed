import { IsEnum } from 'class-validator';
import { SeedType } from '@prisma/client';

/**
 * Uma Seed pode se transformar em Projeto, Documento, Artigo, Checklist,
 * Livro, Planejamento ou Objetivo — sem nunca perder o histórico (a
 * transformação é registrada como uma nova SeedVersion).
 */
export class TransformSeedDto {
  @IsEnum(SeedType)
  type: SeedType;
}
