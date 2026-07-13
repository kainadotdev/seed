import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MaxLength(2000)
  message: string;

  /** Quando ausente, a mensagem vai para a conversa global do usuário. */
  @IsOptional()
  @IsString()
  seedId?: string;
}
