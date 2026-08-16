import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { RapportsService } from 'src/modules/rapports/rapports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

/**
 * §7 : "Cette ressource est en lecture seule pour les 3 rôles côté
 * frontend — aucun endpoint d'écriture n'est appelé directement dessus."
 * Uniquement GET ici ; la création se fait en interne via
 * RapportsService.createFromStagiaire(), appelée depuis
 * StagiairesService.evaluerRapport().
 *
 * Montée sous /bibliotheque, /espace-stagiaire/bibliotheque et
 * /espace-encadrant/bibliotheque côté frontend (§6.6) — les 3 rôles y
 * accèdent donc tous.
 */
@Controller('rapports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RapportsController {
  constructor(private readonly rapportsService: RapportsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.ENCADRANT, Role.STAGIAIRE)
  findAll(
    @Query('departement') departement?: string,
    @Query('annee') annee?: string,
    @Query('search') search?: string,
  ) {
    return this.rapportsService.findAll({
      departement,
      annee: annee ? parseInt(annee, 10) : undefined,
      search,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ENCADRANT, Role.STAGIAIRE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rapportsService.findOne(id);
  }
}