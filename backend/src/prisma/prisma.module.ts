import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global para que qualquer módulo (Users, Seeds, Auth, AI) possa injetar
 * o PrismaService sem precisar reimportar o módulo repetidamente.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
