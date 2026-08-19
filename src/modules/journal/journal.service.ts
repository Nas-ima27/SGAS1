import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from './entities/journal-entry.entity';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { AddJournalCommentDto } from './dto/add-journal-comment.dto';

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

  /**
   * PATCH /stagiaires/:id/journal/:entryId/commentaire
   * La vérification que l'entrée appartient bien à ce stagiaireId (et pas
   * à un autre) est faite ici, pas seulement dans l'URL — sinon un
   * encadrant pourrait commenter n'importe quelle entrée en devinant son
   * id, tant que le stagiaireId dans l'URL est bien le sien.
   */
  async addComment(
    stagiaireId: number,
    entryId: number,
    dto: AddJournalCommentDto,
  ): Promise<JournalEntry> {
    const entry = await this.journalRepository.findOne({
      where: { id: entryId, stagiaireId },
    });
    if (!entry) {
      throw new NotFoundException(`Entrée de journal ${entryId} introuvable.`);
    }
    entry.commentaireEncadrant = dto.commentaire;
    return this.journalRepository.save(entry);
  }
}