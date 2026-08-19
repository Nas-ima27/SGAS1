import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StagiairesController } from './stagiaires.controller';
import { StagiairesService } from './stagiaires.service';
import { Stagiaire } from './entities/stagiaire.entity';
import { Sujet } from '../sujets/entities/sujet.entity';
import { RapportsModule } from '../rapports/rapports.module';
import { UploadsModule } from '../uploads/uploads.module';
import { EmailUniquenessModule } from '../../common/email-uniqueness/email-uniqueness.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stagiaire, Sujet]),
    RapportsModule,
    UploadsModule,
    EmailUniquenessModule,
  ],
  controllers: [StagiairesController],
  providers: [StagiairesService],
  // Exporté pour que d'autres modules (ex: candidatures, lors de l'acceptation
  // d'une candidature — voir BACKEND_SPEC.md §6 "faut-il déclencher
  // automatiquement une mise à jour du Stagiaire correspondant ?") puissent
  // réutiliser StagiairesService sans le redéclarer.
  exports: [StagiairesService],
})
export class StagiairesModule {}
