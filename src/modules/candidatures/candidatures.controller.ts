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
import { CandidaturesService } from './candidatures.service';
import { SujetsService } from '../sujets/sujets.service';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { UpdateCandidatureDto } from './dto/update-candidature.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RequestUser } from '../auth/jwt.strategy';

interface RequestWithUser {
  user: RequestUser;
}

@Controller('candidatures')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidaturesController {
  constructor(
    private readonly candidaturesService: CandidaturesService,
    private readonly sujetsService: SujetsService,
  ) {}

  /**
   * GET /candidatures
   * §6 : "Le frontend filtre côté client selon le rôle (par sujetId pour
   * un encadrant, par candidatEmail pour un stagiaire)" — on renvoie donc
   * la liste complète ici aux 3 rôles, le filtrage fin reste côté client
   * pour l'instant, comme explicitement noté dans le spec.
   */
  @Get()
  @Roles(Role.ADMIN, Role.ENCADRANT, Role.STAGIAIRE)
  findAll() {
    return this.candidaturesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ENCADRANT, Role.STAGIAIRE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.candidaturesService.findOne(id);
  }

  /**
   * POST /candidatures
   * Réservé au Stagiaire (candidate en son propre nom — voir §1 :
   * "un Stagiaire ne doit pouvoir consulter/modifier que ses propres
   * candidatures"). Vérifie que stagiaireId correspond au compte connecté.
   */
  @Post()
  @Roles(Role.STAGIAIRE)
  create(@Body() dto: CreateCandidatureDto, @Req() req: RequestWithUser) {
    if (dto.stagiaireId !== req.user.id) {
      throw new ForbiddenException(
        'Vous ne pouvez candidater qu’en votre propre nom.',
      );
    }
    return this.candidaturesService.create(dto);
  }

  /**
   * PATCH /candidatures/:id
   * Accepter/Refuser — réservé à Admin et Encadrant (§6.5 frontend :
   * CandidaturesPage pour Admin, CandidaturesRecuesPage pour Encadrant).
   * Un Encadrant ne peut traiter que les candidatures sur SES propres
   * sujets — vérification de propriété fine, cohérente avec la règle
   * générale du §1 ("Un Encadrant ne doit pouvoir modifier/consulter en
   * détail que ses propres sujets et stagiaires").
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.ENCADRANT)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCandidatureDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.role === Role.ENCADRANT) {
      const candidature = await this.candidaturesService.findOne(id);
      const sujet = await this.sujetsService.findOne(candidature.sujetId);
      if (sujet.encadrantId !== req.user.id) {
        throw new ForbiddenException(
          'Vous ne pouvez traiter que les candidatures sur vos propres sujets.',
        );
      }
    }

    return this.candidaturesService.update(id, dto);
  }
}