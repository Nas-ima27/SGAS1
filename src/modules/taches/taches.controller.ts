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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TachesService } from './taches.service';
import { CreateTacheDto } from './dto/create-tache.dto';
import { UpdateTacheStatutDto } from './dto/update-tache-statut.dto';
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
 * Routes imbriquées sous /stagiaires/:id/taches, même pattern que
 * JournalController — "tâches à faire" que l'encadrant assigne à son
 * stagiaire :
 * - l'encadrant assigné crée les tâches
 * - le stagiaire lit ses tâches et coche celles qu'il a terminées
 * - l'admin a un accès en lecture (cohérent avec le reste de l'app)
 */
@Controller('stagiaires/:id/taches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TachesController {
  constructor(
    private readonly tachesService: TachesService,
    @InjectRepository(Stagiaire)
    private readonly stagiaireRepository: Repository<Stagiaire>,
  ) {}

  @Get()
  @Roles(Role.STAGIAIRE, Role.ENCADRANT, Role.ADMIN)
  async findAll(
    @Param('id', ParseIntPipe) stagiaireId: number,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.role === Role.STAGIAIRE && req.user.id !== stagiaireId) {
      throw new ForbiddenException('Vous ne pouvez consulter que vos propres tâches.');
    }
    if (req.user.role === Role.ENCADRANT) {
      await this.assertEncadrantOwnsStagiaire(stagiaireId, req.user.id);
    }
    return this.tachesService.findByStagiaire(stagiaireId);
  }

  /** POST /stagiaires/:id/taches — réservé à l'encadrant assigné. */
  @Post()
  @Roles(Role.ENCADRANT)
  async create(
    @Param('id', ParseIntPipe) stagiaireId: number,
    @Body() dto: CreateTacheDto,
    @Req() req: RequestWithUser,
  ) {
    await this.assertEncadrantOwnsStagiaire(stagiaireId, req.user.id);
    return this.tachesService.create(stagiaireId, dto);
  }

  /**
   * PATCH /stagiaires/:id/taches/:tacheId — réservé au stagiaire
   * propriétaire, pour cocher/décocher une tâche comme faite. L'encadrant
   * assigne la tâche mais ne modifie pas son statut lui-même.
   */
  @Patch(':tacheId')
  @Roles(Role.STAGIAIRE)
  async updateStatut(
    @Param('id', ParseIntPipe) stagiaireId: number,
    @Param('tacheId', ParseIntPipe) tacheId: number,
    @Body() dto: UpdateTacheStatutDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.id !== stagiaireId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres tâches.');
    }
    return this.tachesService.updateStatut(stagiaireId, tacheId, dto);
  }

  private async assertEncadrantOwnsStagiaire(
    stagiaireId: number,
    encadrantId: number,
  ): Promise<void> {
    const stagiaire = await this.stagiaireRepository.findOne({
      where: { id: stagiaireId },
    });
    if (!stagiaire || stagiaire.encadrantId !== encadrantId) {
      throw new ForbiddenException(
        'Vous ne pouvez gérer les tâches que de vos propres stagiaires.',
      );
    }
  }
}
