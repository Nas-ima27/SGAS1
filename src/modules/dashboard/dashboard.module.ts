import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Stagiaire } from '../stagiaires/entities/stagiaire.entity';
import { Sujet } from '../sujets/entities/sujet.entity';
import { Candidature } from '../candidatures/entities/candidature.entity';
import { Rapport } from '../rapports/entities/rapport.entity';

@Module({
  // Aucune entité propre au module dashboard — il agrège les 4 entités
  // des autres modules (voir dashboard.service.ts).
  imports: [TypeOrmModule.forFeature([Stagiaire, Sujet, Candidature, Rapport])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}