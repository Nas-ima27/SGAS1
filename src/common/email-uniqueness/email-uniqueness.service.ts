import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/auth/entities/user.entity';
import { Encadrant } from '../../modules/encadrants/entities/encadrant.entity';
import { Stagiaire } from '../../modules/stagiaires/entities/stagiaire.entity';

export type AccountEmailEntity = 'user' | 'encadrant' | 'stagiaire';

@Injectable()
export class EmailUniquenessService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Encadrant) private readonly encadrants: Repository<Encadrant>,
    @InjectRepository(Stagiaire) private readonly stagiaires: Repository<Stagiaire>,
  ) {}

  normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  async assertAvailable(
    email: string,
    exclude?: { entity: AccountEmailEntity; id: number },
  ): Promise<void> {
    const value = this.normalize(email);
    const alreadyExists = await Promise.all([
      this.hasEmail(this.users, 'user', value, exclude),
      this.hasEmail(this.encadrants, 'encadrant', value, exclude),
      this.hasEmail(this.stagiaires, 'stagiaire', value, exclude),
    ]);

    if (alreadyExists.some(Boolean)) {
      throw new ConflictException('Un compte existe deja avec cette adresse e-mail.');
    }
  }

  private async hasEmail<T extends { id: number; email: string }>(
    repository: Repository<T>,
    alias: AccountEmailEntity,
    email: string,
    exclude?: { entity: AccountEmailEntity; id: number },
  ): Promise<boolean> {
    const query = repository
      .createQueryBuilder(alias)
      .where(`LOWER(${alias}.email) = :email`, { email });

    if (exclude?.entity === alias) {
      query.andWhere(`${alias}.id != :id`, { id: exclude.id });
    }

    return (await query.getCount()) > 0;
  }
}
