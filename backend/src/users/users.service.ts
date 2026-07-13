import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Perfil público de um usuário, incluindo apenas Seeds públicas. */
  async findPublicProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
        seeds: {
          where: { visibility: 'PUBLIC', archived: false },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            content: true,
            type: true,
            status: true,
            visibility: true,
            favorite: true,
            archived: true,
            tags: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Estatísticas inspiradas em perfil do GitHub: total de Seeds, Seeds por
   * estágio de evolução, dias ativos (dias distintos com criação/edição) e
   * "contribuições" (soma de versões geradas — cada evolução conta).
   */
  async getStats(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        createdAt: true,
        seeds: {
          select: {
            id: true,
            status: true,
            visibility: true,
            createdAt: true,
            updatedAt: true,
            versions: { select: { createdAt: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const activeDays = new Set<string>();
    let contributions = 0;
    const byStatus: Record<string, number> = { SEMENTE: 0, CRESCENDO: 0, PROJETO: 0, COLHIDA: 0 };
    let publicSeeds = 0;

    for (const seed of user.seeds) {
      byStatus[seed.status] = (byStatus[seed.status] ?? 0) + 1;
      if (seed.visibility === 'PUBLIC') publicSeeds += 1;
      activeDays.add(seed.createdAt.toISOString().slice(0, 10));
      for (const v of seed.versions) {
        contributions += 1;
        activeDays.add(v.createdAt.toISOString().slice(0, 10));
      }
    }

    return {
      totalSeeds: user.seeds.length,
      byStatus,
      publicSeeds,
      activeDays: activeDays.size,
      contributions,
      memberSince: user.createdAt,
    };
  }
}
