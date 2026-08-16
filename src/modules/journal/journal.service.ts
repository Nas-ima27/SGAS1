import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from './entities/journal-entry.entity';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(JournalEntry)
    private readonly journalRepository: Repository<JournalEntry>,
  ) {}

  /**
   * GET /stagiaires/:id/journal
   * §8 : "Trié du plus récent au plus ancien."
   */
  findByStagiaire(stagiaireId: number): Promise<JournalEntry[]> {
    return this.journalRepository.find({
      where: { stagiaireId },
      order: { date: 'DESC' },
    });
  }

  create(stagiaireId: number, dto: CreateJournalEntryDto): Promise<JournalEntry> {
    const entry = this.journalRepository.create({
      ...dto,
      stagiaireId,
    });
    return this.journalRepository.save(entry);
  }
}