import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeedDto } from './dto/create-seed.dto';
import { UpdateSeedDto } from './dto/update-seed.dto';

const TRANSFORM_LABEL: Record<string, string> = {
  PENSAMENTO: 'Pensamento',
  PROJETO: 'Projeto',
  DOCUMENTO: 'Documento',
  OBJETIVO: 'Objetivo',
  CHECKLIST: 'Checklist',
  DIARIO: 'Diário',
  ARTIGO: 'Artigo',
  LIVRO: 'Livro',
  PLANEJAMENTO: 'Planejamento',
};

/** Palavras de baixo valor semântico, ignoradas na busca em linguagem natural. */
const STOPWORDS = new Set([
  'a', 'o', 'os', 'as', 'de', 'da', 'do', 'das', 'dos', 'um', 'uma', 'uns', 'umas',
  'e', 'ou', 'que', 'com', 'sem', 'para', 'por', 'em', 'no', 'na', 'nos', 'nas',
  'sobre', 'como', 'algo', 'me', 'meu', 'minha', 'meus', 'minhas', 'ideia', 'seed',
  'encontre', 'busque', 'procurar', 'quero', 'achar', 'ache', 'sobre', 'aquela',
]);

/** Deriva um título curto e legível a partir do conteúdo, quando não informado. */
function deriveTitle(content: string): string {
  const clean = content.replace(/\s+/g, ' ').trim();
  if (!clean) return 'Nova Seed';
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

@Injectable()
export class SeedsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Timeline do próprio usuário — mais recentes primeiro, sem arquivadas por padrão. */
  async findAllForUser(ownerId: string, includeArchived = false) {
    return this.prisma.seed.findMany({
      where: { ownerId, ...(includeArchived ? {} : { archived: false }) },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, requesterId?: string) {
    const seed = await this.prisma.seed.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { createdAt: 'desc' } },
        owner: { select: { id: true, username: true, name: true, avatar: true } },
        _count: { select: { comments: true, savedBy: true } },
      },
    });

    if (!seed) {
      throw new NotFoundException('Seed não encontrada.');
    }

    const isOwner = seed.ownerId === requesterId;
    if (seed.visibility === 'PRIVATE' && !isOwner) {
      throw new ForbiddenException('Esta Seed é privada.');
    }

    return { ...seed, isOwner };
  }

  async create(ownerId: string, dto: CreateSeedDto) {
    const title = dto.title?.trim() || deriveTitle(dto.content);

    return this.prisma.seed.create({
      data: {
        ownerId,
        title,
        content: dto.content,
        type: dto.type,
        tags: dto.tags ?? [],
        versions: {
          create: { content: dto.content, note: 'Seed criada' },
        },
      },
    });
  }

  async update(id: string, requesterId: string, dto: UpdateSeedDto) {
    const seed = await this.assertOwnership(id, requesterId);

    const contentChanged = dto.content !== undefined && dto.content !== seed.content;
    const typeChanged = dto.type !== undefined && dto.type !== seed.type;

    const versionNotes: string[] = [];
    if (contentChanged) versionNotes.push('Conteúdo atualizado');
    if (typeChanged) versionNotes.push(`Transformada em ${TRANSFORM_LABEL[dto.type as string] ?? dto.type}`);

    return this.prisma.seed.update({
      where: { id },
      data: {
        ...dto,
        ...(versionNotes.length > 0 && {
          versions: {
            create: {
              content: dto.content ?? seed.content,
              note: versionNotes.join(' · '),
            },
          },
        }),
      },
    });
  }

  /** Transforma a Seed em outro tipo de resultado, preservando todo o histórico. */
  async transform(id: string, requesterId: string, type: string) {
    const seed = await this.assertOwnership(id, requesterId);
    return this.prisma.seed.update({
      where: { id },
      data: {
        type: type as any,
        status: seed.status === 'SEMENTE' ? 'CRESCENDO' : seed.status,
        versions: {
          create: {
            content: seed.content,
            note: `🌱 Transformada em ${TRANSFORM_LABEL[type] ?? type}`,
          },
        },
      },
    });
  }

  async remove(id: string, requesterId: string) {
    await this.assertOwnership(id, requesterId);
    await this.prisma.seed.delete({ where: { id } });
    return { success: true };
  }

  /** Busca em linguagem natural: tokeniza a consulta e pontua por título/conteúdo/tags. */
  async search(ownerId: string, query: string) {
    const tokens = tokenize(query);
    const seeds = await this.prisma.seed.findMany({
      where: { ownerId, archived: false },
      orderBy: { updatedAt: 'desc' },
    });

    if (tokens.length === 0) return seeds.slice(0, 20);

    const scored = seeds
      .map((seed) => {
        const haystack = tokenize(`${seed.title} ${seed.content} ${seed.tags.join(' ')} ${seed.type} ${seed.status}`);
        let score = 0;
        for (const token of tokens) {
          if (haystack.includes(token)) score += 3;
          else if (haystack.some((h) => h.startsWith(token) || token.startsWith(h))) score += 1;
        }
        return { seed, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((s) => s.seed).slice(0, 20);
  }

  /** Sugere Seeds relacionadas do mesmo usuário por sobreposição de tags/tipo/palavras. */
  async related(id: string, requesterId: string) {
    const seed = await this.prisma.seed.findUnique({ where: { id } });
    if (!seed) throw new NotFoundException('Seed não encontrada.');
    if (seed.ownerId !== requesterId) return [];

    const others = await this.prisma.seed.findMany({
      where: { ownerId: seed.ownerId, id: { not: id }, archived: false },
    });

    const seedTokens = new Set(tokenize(`${seed.title} ${seed.content}`));

    const scored = others.map((other) => {
      let score = 0;
      const sharedTags = other.tags.filter((t) => seed.tags.includes(t));
      score += sharedTags.length * 4;
      if (other.type === seed.type) score += 2;
      const otherTokens = tokenize(`${other.title} ${other.content}`);
      const overlap = otherTokens.filter((t) => seedTokens.has(t)).length;
      score += overlap;
      return { seed: other, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.seed);
  }

  /** Feed público da Comunidade: apenas Seeds que o autor escolheu publicar. */
  async findPublicFeed() {
    return this.prisma.seed.findMany({
      where: { visibility: 'PUBLIC', archived: false },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        owner: { select: { id: true, username: true, name: true, avatar: true } },
        _count: { select: { comments: true, savedBy: true } },
      },
    });
  }

  async listComments(seedId: string, requesterId?: string) {
    await this.findOne(seedId, requesterId); // valida visibilidade/permissão
    return this.prisma.comment.findMany({
      where: { seedId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, username: true, name: true, avatar: true } } },
    });
  }

  async addComment(seedId: string, authorId: string, content: string) {
    const seed = await this.prisma.seed.findUnique({ where: { id: seedId } });
    if (!seed) throw new NotFoundException('Seed não encontrada.');
    if (seed.visibility !== 'PUBLIC' && seed.ownerId !== authorId) {
      throw new ForbiddenException('Só é possível comentar em Seeds públicas.');
    }
    return this.prisma.comment.create({
      data: { seedId, authorId, content },
      include: { author: { select: { id: true, username: true, name: true, avatar: true } } },
    });
  }

  async saveSeed(seedId: string, userId: string) {
    const seed = await this.prisma.seed.findUnique({ where: { id: seedId } });
    if (!seed || seed.visibility !== 'PUBLIC') {
      throw new ForbiddenException('Só é possível salvar Seeds públicas.');
    }
    return this.prisma.savedSeed.upsert({
      where: { seedId_userId: { seedId, userId } },
      update: {},
      create: { seedId, userId },
    });
  }

  async unsaveSeed(seedId: string, userId: string) {
    await this.prisma.savedSeed.deleteMany({ where: { seedId, userId } });
    return { success: true };
  }

  async listSaved(userId: string) {
    const saved = await this.prisma.savedSeed.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        seed: {
          include: { owner: { select: { id: true, username: true, name: true, avatar: true } } },
        },
      },
    });
    return saved.map((s) => s.seed);
  }

  private async assertOwnership(id: string, requesterId: string) {
    const seed = await this.prisma.seed.findUnique({ where: { id } });
    if (!seed) {
      throw new NotFoundException('Seed não encontrada.');
    }
    if (seed.ownerId !== requesterId) {
      throw new ForbiddenException('Você não tem permissão para alterar esta Seed.');
    }
    return seed;
  }
}
