import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Protege rotas exigindo um access token JWT válido. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
