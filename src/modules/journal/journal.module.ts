import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { JournalEntry } from './entities/journal-entry.entity';
import { Stagiaire } from '../stagiaires/entities/stagiaire.entity';

@Module({
  // Stagiaire importé ici pour la vérification de propriété Encadrant→Stagiaire
  // dans JournalController (même pattern que EncadrantsModule avec Stagiaire).
  imports: [TypeOrmModule.forFeature([JournalEntry, Stagiaire])],
  controllers: [JournalController],
  providers: [JournalService],
})
export class JournalModule {}