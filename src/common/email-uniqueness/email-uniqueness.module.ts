import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../modules/auth/entities/user.entity';
import { Encadrant } from '../../modules/encadrants/entities/encadrant.entity';
import { Stagiaire } from '../../modules/stagiaires/entities/stagiaire.entity';
import { EmailUniquenessService } from './email-uniqueness.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Encadrant, Stagiaire])],
  providers: [EmailUniquenessService],
  exports: [EmailUniquenessService],
})
export class EmailUniquenessModule {}
