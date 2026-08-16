import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sujet } from './entities/sujet.entity';
import { SujetStatut } from './enums/sujet-statut.enum';
import { CreateSujetDto } from './dto/create-sujet.dto';
import { UpdateSujetDto } from './dto/update-sujet.dto';
import { SimilarityCheckDto } from './dto/similarity-check.dto';

export type SujetWithCount = Sujet & { nombreCandidatures: number };

export interface SimilarityMatch {
  id: number;
  titre: string;
  score: number;
}

/** Score minimal (0-1) au-delà duquel un sujet est considéré "similaire" (voir §5). */
const SIMILARITY_THRESHOLD = 0.15;

/** Mots trop courants pour être discriminants dans une comparaison de sujets en français. */
const STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'pour',
  'dans', 'sur', 'avec', 'au', 'aux', 'en', 'par', 'ce', 'ces', 'est',
  'sont', 'à', 'a', 'que', 'qui', 'se', 'son', 'sa', 'ses',
]);

function tokenize(text: string): Set<string> {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // retire les accents pour comparer plus large

  const words = normalized.match(/[a-z0-9]+/g) ?? [];
  return new Set(words.filter((w) => w.length > 2 && !STOPWORDS.has(w)));
}

/** Indice de Jaccard : taille de l'intersection / taille de l'union des deux ensembles de mots. */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersectionSize = 0;
  for (const word of a) {
    if (b.has(word)) intersectionSize++;
  }
  const unionSize = a.size + b.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

@Injectable()
export class SujetsService {
  constructor(
    @InjectRepository(Sujet)
    private readonly sujetRepository: Repository<Sujet>,
  ) {}

  async findAll(): Promise<SujetWithCount[]> {
    const sujets = await this.sujetRepository.find();
    return Promise.all(sujets.map((s) => this.withCount(s)));
  }

  async findOne(id: number): Promise<SujetWithCount> {
    const sujet = await this.sujetRepository.findOne({ where: { id } });
    if (!sujet) {
      throw new NotFoundException(`Sujet ${id} introuvable.`);
    }
    return this.withCount(sujet);
  }

  async create(dto: CreateSujetDto): Promise<SujetWithCount> {
    const sujet = this.sujetRepository.create({
      ...dto,
      statut: dto.statut ?? SujetStatut.BROUILLON,
    });
    const saved = await this.sujetRepository.save(sujet);
    return this.withCount(saved);
  }

  async update(id: number, dto: UpdateSujetDto): Promise<SujetWithCount> {
    const sujet = await this.sujetRepository.findOne({ where: { id } });
    if (!sujet) {
      throw new NotFoundException(`Sujet ${id} introuvable.`);
    }
    Object.assign(sujet, dto);
    const saved = await this.sujetRepository.save(sujet);
    return this.withCount(saved);
  }

  /**
   * POST /sujets/similarity-check
   *
   * Compare le texte fourni (titre + description) à tous les sujets
   * existants via un indice de Jaccard sur les mots significatifs.
   * Implémentation volontairement simple (pas de dépendance externe,
   * pas d'IA) — un point d'entrée à améliorer plus tard si besoin
   * (embeddings sémantiques, pg_trgm, etc.) sans changer le contrat
   * de cet endpoint.
   *
   * Ne compare pour l'instant qu'aux Sujets existants — la comparaison
   * à la bibliothèque de rapports archivés (§7) est en TODO, la table
   * "rapports" n'existant pas encore (module rapports pas encore construit).
   */
  async checkSimilarity(dto: SimilarityCheckDto): Promise<SimilarityMatch[]> {
    const queryTokens = tokenize(`${dto.titre} ${dto.description}`);

    const existingSujets = await this.sujetRepository.find();

    const matches: SimilarityMatch[] = existingSujets
      .map((sujet) => {
        const sujetTokens = tokenize(`${sujet.titre} ${sujet.description ?? ''}`);
        return {
          id: sujet.id,
          titre: sujet.titre,
          score: Math.round(jaccardSimilarity(queryTokens, sujetTokens) * 100) / 100,
        };
      })
      .filter((match) => match.score >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.score - a.score);

    // TODO (voir BACKEND_SPEC.md §7) : ajouter la comparaison contre les
    // rapports archivés une fois le module "rapports" construit.

    return matches;
  }

  /**
   * Calcule nombreCandidatures (§5 : "valeur calculée" — COUNT sur
   * candidatures). SQL brut car le module candidatures n'existe pas
   * encore ; filet de sécurité .catch pour ne pas faire échouer la
   * lecture d'un sujet tant que la table "candidatures" n'existe pas.
   */
  private async withCount(sujet: Sujet): Promise<SujetWithCount> {
    const rows: Array<{ count: string }> = await this.sujetRepository.manager
      .query('SELECT COUNT(*) AS count FROM candidatures WHERE "sujetId" = $1', [sujet.id])
      .catch(() => [{ count: '0' }]);

    return {
      ...sujet,
      nombreCandidatures: parseInt(rows[0]?.count ?? '0', 10),
    };
  }
}