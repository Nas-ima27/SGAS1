import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RapportsController } from './rapports.controller';
import { RapportsService } from './rapports.service';
import { Rapport } from './entities/rapport.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rapport])],
  controllers: [RapportsController],
  providers: [RapportsService],
  // Exporté pour que StagiairesModule puisse injecter RapportsService
  // et déclencher createFromStagiaire() lors de la validation d'un
  // rapport (voir stagiaires.service.ts → evaluerRapport).
  exports: [RapportsService],
})
export class RapportsModule {}