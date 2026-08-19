import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StagiairesService } from './stagiaires.service';
import { CreateStagiaireDto } from './dto/create-stagiaire.dto';
import { UpdateStagiaireDto, UpdateStagiaireDto as UpdateStagiairePayloadDto } from './dto/update-stagiaire.dto';
import { AffectationDto } from './dto/affectation.dto';
import { EvaluationRapportDto } from './dto/evaluation-rapport.dto';
import { UpdateStagiaireProfileDto } from './dto/update-stagiaire-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RequestUser } from '../auth/jwt.strategy';

interface RequestWithUser {
  user: RequestUser;
}

@Controller('stagiaires')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StagiairesController {
  constructor(private readonly stagiairesService: StagiairesService) {}

  /**
   * GET /stagiaires
   * Admin : liste complète (StagiairesPage).
   * Encadrant : le frontend filtre côté client sur encadrantId === user.id
   * pour MesStagiairesPage — on renvoie la liste complète ici aussi, la
   * restriction fine (voir §1) s'applique au détail (GET /:id), pas au listing.
   */
  @Get()
  @Roles(Role.ADMIN, Role.ENCADRANT)
  findAll() {
    return this.stagiairesService.findAll();
  }

  /**
   * GET /stagiaires/:id
   * Un Encadrant ne peut consulter en détail que ses propres stagiaires (§1).
   * Un Stagiaire ne peut consulter que sa propre fiche (utilisé par
   * MonStagePage côté espace-stagiaire, §6.9 frontend — pas d'endpoint
   * /stagiaires/me dédié dans le spec, donc réutilisation de cette route
   * avec vérification de propriété).
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.ENCADRANT, Role.STAGIAIRE)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    const stagiaire = await this.stagiairesService.findOne(id);

    if (req.user.role === Role.ENCADRANT && stagiaire.encadrantId !== req.user.id) {
      throw new ForbiddenException('Ce stagiaire ne vous est pas assigné.');
    }

    if (req.user.role === Role.STAGIAIRE && req.user.id !== id) {
      throw new ForbiddenException('Vous ne pouvez consulter que votre propre fiche.');
    }

    return stagiaire;
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateStagiaireDto) {
    return this.stagiairesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStagiaireDto) {
    return this.stagiairesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stagiairesService.remove(id);
  }

  @Patch(':id/affectation')
  @Roles(Role.ADMIN)
  affecter(@Param('id', ParseIntPipe) id: number, @Body() dto: AffectationDto) {
    return this.stagiairesService.affecterEncadrant(id, dto);
  }

  /**
   * POST /stagiaires/:id/rapport
   * Réservé au Stagiaire propriétaire (voir §1 : "un Stagiaire ne doit
   * pouvoir consulter/modifier que ses propres [...] son propre rapport").
   * Upload réel vers S3 via UploadsService (voir stagiaires.service.ts).
   */
  @Post(':id/rapport')
  @Roles(Role.STAGIAIRE)
  @UseInterceptors(FileInterceptor('file'))
  deposerRapport(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Vous ne pouvez déposer que votre propre rapport.');
    }

    return this.stagiairesService.deposerRapport(id, file);
  }

  /**
   * PATCH /stagiaires/:id/rapport/evaluation
   * Réservé à l'Encadrant assigné à ce stagiaire — la vérification fine
   * (encadrantId === req.user.id) est déléguée au service (voir
   * stagiaires.service.ts → evaluerRapport), qui a besoin du stagiaire
   * chargé pour la faire.
   */
  @Patch(':id/rapport/evaluation')
  @Roles(Role.ENCADRANT)
  evaluer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EvaluationRapportDto,
    @Req() req: RequestWithUser,
  ) {
    return this.stagiairesService.evaluerRapport(id, dto, req.user);
  }

  /**
   * PATCH /stagiaires/:id/profile
   * Réservé au Stagiaire propriétaire — modifie uniquement ses infos
   * personnelles (telephone, linkedin, github, bio).
   */
  @Patch(':id/profile')
  @Roles(Role.STAGIAIRE)
  updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStagiaireProfileDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Vous ne pouvez modifier que votre propre profil.');
    }
    return this.stagiairesService.updateProfile(id, dto);
  }
}