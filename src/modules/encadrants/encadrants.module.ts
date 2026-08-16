import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncadrantsController } from './encadrants.controller';
import { EncadrantsService } from './encadrants.service';
import { Encadrant } from './entities/encadrant.entity';
import { Stagiaire } from '../stagiaires/entities/stagiaire.entity';

@Module({
  // Stagiaire est importé ici en plus d'Encadrant car EncadrantsService
  // injecte Repository<Stagiaire> pour calculer stagiairesActifs/totalEncadres
  // (voir encadrants.service.ts) — TypeOrmModule.forFeature doit lister
  // toutes les entités dont ce module a besoin, même si Stagiaire "appartient"
  // conceptuellement au module stagiaires.
  imports: [TypeOrmModule.forFeature([Encadrant, Stagiaire])],
  controllers: [EncadrantsController],
  providers: [EncadrantsService],
  exports: [EncadrantsService],
})
export class EncadrantsModule {}