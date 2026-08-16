import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { DashboardService } from './dashboard.service';

/**
 * §9 : "Endpoint suggéré : GET /dashboard/stats retournant un objet
 * composite avec toutes ces valeurs en un seul appel, pour éviter le
 * sur-fetching côté frontend."
 * Réservé à l'Admin — le dashboard décisionnel n'existe que dans l'espace
 * Admin côté frontend (§6.7).
 */
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.ADMIN)
  getStats() {
    return this.dashboardService.getStats();
  }
}