import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

/**
 * Camada de integração com o `ai-service` (FastAPI). O backend NestJS nunca
 * fala diretamente com um provedor de LLM — ele delega ao serviço de IA e
 * persiste o histórico de conversa (AIConversation) no Postgres, para que a
 * IA global e a IA por Seed tenham memória real (embeddings/pgvector no
 * roadmap). A IA sempre ajuda a desenvolver a ideia do usuário — nunca decide
 * ou publica nada sozinha.
 */
@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  async sendMessage(userId: string, dto: SendMessageDto) {
    await this.prisma.aIConversation.create({
      data: {
        userId,
        seedId: dto.seedId ?? null,
        role: 'USER',
        message: dto.message,
      },
    });

    const reply = await this.callAIService(userId, dto);

    const saved = await this.prisma.aIConversation.create({
      data: {
        userId,
        seedId: dto.seedId ?? null,
        role: 'AI',
        message: reply,
      },
    });

    return saved;
  }

  async getHistory(userId: string, seedId?: string) {
    return this.prisma.aIConversation.findMany({
      where: { userId, seedId: seedId ?? null },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Chama o ai-service (FastAPI), enviando o conteúdo real da Seed (quando
   * houver) e pistas de memória (Seeds parecidas antigas, Seed parada há
   * muito tempo) para que a resposta seja realmente contextual.
   */
  private async callAIService(userId: string, dto: SendMessageDto): Promise<string> {
    const seed = dto.seedId
      ? await this.prisma.seed.findUnique({ where: { id: dto.seedId } })
      : null;

    const memory = seed ? await this.buildMemoryHints(userId, seed) : [];

    try {
      const { data } = await firstValueFrom(
        this.http.post(`${this.aiServiceUrl}/chat`, {
          user_id: userId,
          seed_id: dto.seedId ?? null,
          message: dto.message,
          seed_title: seed?.title ?? null,
          seed_content: seed?.content ?? null,
          seed_type: seed?.type ?? null,
          seed_status: seed?.status ?? null,
          seed_tags: seed?.tags ?? [],
          memory_hints: memory,
        }),
      );
      return data.reply as string;
    } catch (error) {
      this.logger.warn(
        `ai-service indisponível, usando fallback. Detalhe: ${(error as Error).message}`,
      );
      return 'A IA está temporariamente indisponível. Sua mensagem foi salva e será processada em breve.';
    }
  }

  /** Monta pistas de memória: Seeds parecidas antigas e Seeds paradas há muito tempo. */
  private async buildMemoryHints(userId: string, seed: { id: string; tags: string[]; type: string; updatedAt: Date }) {
    const hints: string[] = [];

    const daysSinceUpdate = Math.floor((Date.now() - seed.updatedAt.getTime()) / 86_400_000);
    if (daysSinceUpdate >= 30) {
      hints.push(`Esta Seed está parada há cerca de ${daysSinceUpdate} dias.`);
    }

    if (seed.tags.length > 0) {
      const similar = await this.prisma.seed.findFirst({
        where: {
          ownerId: userId,
          id: { not: seed.id },
          tags: { hasSome: seed.tags },
        },
        orderBy: { createdAt: 'asc' },
      });
      if (similar) {
        const monthsAgo = Math.floor((Date.now() - similar.createdAt.getTime()) / (30 * 86_400_000));
        if (monthsAgo >= 1) {
          hints.push(`Você escreveu algo parecido ("${similar.title}") há cerca de ${monthsAgo} mês(es).`);
        } else {
          hints.push(`Essa ideia está relacionada a outra Seed sua: "${similar.title}".`);
        }
      }
    }

    return hints;
  }
}
