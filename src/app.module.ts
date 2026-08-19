import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/data-source';
import { AuthModule } from './modules/auth/auth.module';
import { StagiairesModule } from './modules/stagiaires/stagiaires.module';
import { EncadrantsModule } from './modules/encadrants/encadrants.module';
import { SujetsModule } from './modules/sujets/sujets.module';
import { CandidaturesModule } from './modules/candidatures/candidatures.module';
import { JournalModule } from './modules/journal/journal.module';
import { TachesModule } from './modules/taches/taches.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UsersModule } from './modules/users/users.module';
@Module({
  imports: [
    // Charge .env une seule fois et rend process.env / ConfigService disponibles
    // partout dans l'app, sans avoir à réimporter ConfigModule dans chaque module.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Connexion TypeORM/PostgreSQL — réutilise exactement la même config
    // que celle utilisée par la CLI de migration (src/config/data-source.ts),
    // pour éviter toute divergence entre "l'app qui tourne" et "les migrations".
    TypeOrmModule.forRoot(dataSourceOptions),

    AuthModule,
    StagiairesModule,
    EncadrantsModule,
    SujetsModule,
    CandidaturesModule,
    JournalModule,
    TachesModule,
    DashboardModule,
    UsersModule,
    // Les autres modules métier (sujets, candidatures, rapports, journal,
    // dashboard, users, uploads) seront importés ici un par un au fur
    // et à mesure qu'on les construit.
  ],
})
export class AppModule {}