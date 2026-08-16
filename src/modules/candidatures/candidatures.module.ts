import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidaturesController } from './candidatures.controller';
import { CandidaturesService } from './candidatures.service';
import { Candidature } from './entities/candidature.entity';
import { Sujet } from '../sujets/entities/sujet.entity';
import { Stagiaire } from '../stagiaires/entities/stagiaire.entity';
import { SujetsModule } from '../sujets/sujets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidature, Sujet, Stagiaire]),
    // Importé pour que SujetsService soit injectable dans
    // CandidaturesController (vérification de propriété sur PATCH /:id) —
    // SujetsModule exporte déjà SujetsService (voir sujets.module.ts).
    SujetsModule,
  ],
  controllers: [CandidaturesController],
  providers: [CandidaturesService],
  exports: [CandidaturesService],
})
export class CandidaturesModule {}