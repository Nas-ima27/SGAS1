import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../auth/entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { Utilisateur } from './entities/user.entity';
import { EmailUniquenessModule } from '../../common/email-uniqueness/email-uniqueness.module';

@Module({
  imports: [
    // User importé ici (pas juste Utilisateur) car UsersService crée
    // directement un compte de connexion en même temps que l'entrée
    // annuaire — voir users.service.ts.
    TypeOrmModule.forFeature([Utilisateur, User]),
    MailModule,
    EmailUniquenessModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
