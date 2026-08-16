import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { Stagiaire } from '../stagiaires/entities/stagiaire.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RequestUser } from '../auth/jwt.strategy';

interface RequestWithUser {
  user: RequestUser;
}

/**
 * Routes imbriquées sous /stagiaires/:id/journal (voir BACKEND_SPEC.md §8),
 * dans un controller séparé plutôt que d'alourdir StagiairesController.
 */
@Controller('stagiaires/:id/journal')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JournalController {
  constructor(
    private readonly journalService: JournalService,
    // Repository injecté directement (même pattern que EncadrantsService
    // avec Stagiaire) pour vérifier la propriété Encadrant→Stagiaire sans
    // dépendre de StagiairesService en entier.
    @InjectRepository(Stagiaire)
    private readonly stagiaireRepository: Repository<Stagiaire>,
  ) {}

  /**
   * GET /stagiaires/:id/journal
   * §1 : "Accessible en lecture par le Stagiaire concerné et son
   * Encadrant (mode lecture seule côté frontend pour l'encadrant)."
   */
  @Get()
  @Roles(Role.STAGIAIRE, Role.ENCADRANT, Role.ADMIN)
  async findAll(
    @Param('id', ParseIntPipe) stagiaireId: number,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.role === Role.STAGIAIRE && req.user.id !== stagiaireId) {
      throw new ForbiddenException('Vous ne pouvez consulter que votre propre journal.');
    }

    if (req.user.role === Role.ENCADRANT) {
      const stagiaire = await this.stagiaireRepository.findOne({
        where: { id: stagiaireId },
      });
      if (!stagiaire || stagiaire.encadrantId !== req.user.id) {
        throw new ForbiddenException(
          'Vous ne pouvez consulter que le journal de vos propres stagiaires.',
        );
      }
    }

    return this.journalService.findByStagiaire(stagiaireId);
  }

  /**
   * POST /stagiaires/:id/journal
   * §1 : "Réservé au Stagiaire propriétaire uniquement."
   */
  @Post()
  @Roles(Role.STAGIAIRE)
  create(
    @Param('id', ParseIntPipe) stagiaireId: number,
    @Body() dto: CreateJournalEntryDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.id !== stagiaireId) {
      throw new ForbiddenException('Vous ne pouvez écrire que dans votre propre journal.');
    }
    return this.journalService.create(stagiaireId, dto);
  }
}