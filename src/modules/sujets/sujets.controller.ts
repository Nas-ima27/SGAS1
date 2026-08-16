import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SujetsService } from './sujets.service';
import { CreateSujetDto } from './dto/create-sujet.dto';
import { UpdateSujetDto } from './dto/update-sujet.dto';
import { SimilarityCheckDto } from './dto/similarity-check.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RequestUser } from '../auth/jwt.strategy';

interface RequestWithUser {
  user: RequestUser;
}

@Controller('sujets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SujetsController {
  constructor(private readonly sujetsService: SujetsService) {}

  /**
   * GET /sujets
   * Admin : lecture seule, tous les sujets (§6.4 frontend).
   * Encadrant : ses propres sujets (MesSujetsPage) — filtré côté client
   * comme pour GET /stagiaires, on renvoie la liste complète ici.
   * Stagiaire : consultation des sujets disponibles pour candidater
   * (SujetsDisponiblesPage, §6.5 frontend).
   */
  @Get()
  @Roles(Role.ADMIN, Role.ENCADRANT, Role.STAGIAIRE)
  findAll() {
    return this.sujetsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ENCADRANT, Role.STAGIAIRE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sujetsService.findOne(id);
  }

  /**
   * POST /sujets
   * Réservé aux Encadrants (§5 : "les sujets appartiennent aux encadrants",
   * l'Admin n'a "aucune action d'écriture sur les sujets côté frontend actuel").
   * Un encadrant ne peut créer un sujet qu'en son propre nom.
   */
  @Post()
  @Roles(Role.ENCADRANT)
  create(@Body() dto: CreateSujetDto, @Req() req: RequestWithUser) {
    if (dto.encadrantId !== req.user.id) {
      throw new ForbiddenException(
        'Vous ne pouvez créer un sujet qu’en votre propre nom.',
      );
    }
    return this.sujetsService.create(dto);
  }

  /**
   * PATCH /sujets/:id
   * Réservé à l'Encadrant propriétaire du sujet (§5 : vérifier que
   * encadrantId correspond à l'utilisateur connecté). Sert aussi à
   * Publier/Dépublier (PATCH avec juste { statut }).
   */
  @Patch(':id')
  @Roles(Role.ENCADRANT)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSujetDto,
    @Req() req: RequestWithUser,
  ) {
    const sujet = await this.sujetsService.findOne(id);
    if (sujet.encadrantId !== req.user.id) {
      throw new ForbiddenException('Ce sujet ne vous appartient pas.');
    }
    return this.sujetsService.update(id, dto);
  }

  /**
   * POST /sujets/similarity-check
   * "À implémenter en priorité" (§5) — accessible à tout utilisateur
   * authentifié capable de proposer/vérifier un sujet, donc Encadrant
   * uniquement (seul rôle habilité à créer des sujets).
   */
  @Post('similarity-check')
  @Roles(Role.ENCADRANT)
  checkSimilarity(@Body() dto: SimilarityCheckDto) {
    return this.sujetsService.checkSimilarity(dto);
  }
}