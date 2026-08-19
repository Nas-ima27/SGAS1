import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TachesController } from './taches.controller';
import { TachesService } from './taches.service';
import { Tache } from './entities/tache.entity';
import { Stagiaire } from '../stagiaires/entities/stagiaire.entity';

@Module({
  // Stagiaire importé ici pour la vérification de propriété Encadrant→Stagiaire
  // dans TachesController (même pattern que JournalModule).
  imports: [TypeOrmModule.forFeature([Tache, Stagiaire])],
  controllers: [TachesController],
  providers: [TachesService],
})
export class TachesModule {}
