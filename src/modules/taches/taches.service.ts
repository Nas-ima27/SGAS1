import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tache } from './entities/tache.entity';
import { CreateTacheDto } from './dto/create-tache.dto';
import { UpdateTacheStatutDto } from './dto/update-tache-statut.dto';

@Injectable()
export class TachesService {
  constructor(
    @InjectRepository(Tache)
    private readonly tacheRepository: Repository<Tache>,
  ) {}

  /** GET /stagiaires/:id/taches — triées du plus récent au plus ancien. */
  findByStagiaire(stagiaireId: number): Promise<Tache[]> {
    return this.tacheRepository.find({
      where: { stagiaireId },
      order: { createdAt: 'DESC' },
    });
  }

  create(stagiaireId: number, dto: CreateTacheDto): Promise<Tache> {
    const tache = this.tacheRepository.create({
      ...dto,
      description: dto.description ?? null,
      stagiaireId,
    });
    return this.tacheRepository.save(tache);
  }

  /**
   * Même précaution que JournalService.addComment : on vérifie que la
   * tâche appartient bien à ce stagiaireId, pas seulement à son id, pour
   * qu'un stagiaire ne puisse pas changer le statut d'une tâche d'un
   * autre stagiaire en devinant son id.
   */
  async updateStatut(
    stagiaireId: number,
    tacheId: number,
    dto: UpdateTacheStatutDto,
  ): Promise<Tache> {
    const tache = await this.tacheRepository.findOne({
      where: { id: tacheId, stagiaireId },
    });
    if (!tache) {
      throw new NotFoundException(`Tâche ${tacheId} introuvable.`);
    }
    tache.statut = dto.statut;
    return this.tacheRepository.save(tache);
  }
}
