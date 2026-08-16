import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Applique la stratégie 'jwt' (voir jwt.strategy.ts) à une route ou un controller.
 * Si le token est absent/invalide/expiré, ou si JwtStrategy.validate() rejette
 * le compte (désactivé, introuvable), la requête est bloquée avec 401 avant
 * même d'atteindre le handler.
 *
 * Usage : @UseGuards(JwtAuthGuard) sur un controller ou une méthode.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}