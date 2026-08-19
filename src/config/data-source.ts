import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/auth/entities/user.entity';
import { Stagiaire } from '../modules/stagiaires/entities/stagiaire.entity';
import { Encadrant } from '../modules/encadrants/entities/encadrant.entity';
import { CreateEncadrantsTable1786489718770 } from '../migrations/1786489718770-CreateEncadrantsTable';
import { CreateUsersTable1786462325673 } from '../migrations/1786462325673-CreateUsersTable';
import { CreateStagiairesTable1786479914514 } from '../migrations/1786479914514-CreateStagiairesTable';
import { CreateSujetsTable1786521725988 } from '../migrations/1786521725988-CreateSujetsTable';
import { Sujet } from '../modules/sujets/entities/sujet.entity';
import { Candidature } from '../modules/candidatures/entities/candidature.entity';
import { CreateCandidaturesTable1786522692401 } from '../migrations/1786522692401-CreateCandidaturesTable';
import { AddRapportFichierUrlToStagiaires1786524577882 } from '../migrations/1786524577882-AddRapportFichierUrlToStagiaires';
import { Rapport } from '../modules/rapports/entities/rapport.entity';
import { CreateRapportsTable1786524979103 } from '../migrations/1786524979103-CreateRapportsTable';
import { JournalEntry } from '../modules/journal/entities/journal-entry.entity';
import { CreateJournalEntriesTable1786526579902 } from '../migrations/1786526579902-CreateJournalEntriesTable';
import { AddIsSuperAdminToUsers1786531640866 } from '../migrations/1786531640866-AddIsSuperAdminToUsers';
import { Utilisateur } from '../modules/users/entities/user.entity';
import { CreateUtilisateursTable1786533830067 } from '../migrations/1786533830067-CreateUtilisateursTable';
import { EnforceUniqueAccountEmails1786535000000 } from '../migrations/1786535000000-EnforceUniqueAccountEmails';
import { AddTypeStageAndTypeCandidat1787127569056 } from '../migrations/1787127569056-AddTypeStageAndTypeCandidat';
import { FixUniqueAccountEmailAllowLinkedPair1787200000000 } from '../migrations/1787200000000-FixUniqueAccountEmailAllowLinkedPair';
import { AddMustChangePasswordToUsers1787300000000 } from '../migrations/1787300000000-AddMustChangePasswordToUsers';
import { AddCommentaireEncadrantToJournalEntries1787400000000 } from '../migrations/1787400000000-AddCommentaireEncadrantToJournalEntries';
import { CreateTachesTable1787500000000 } from '../migrations/1787500000000-CreateTachesTable';
import { Tache } from '../modules/taches/entities/tache.entity';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sgas',

  entities: [User, Stagiaire, Encadrant, Sujet, Candidature,Rapport,JournalEntry,Utilisateur,Tache],
  migrations: [CreateUsersTable1786462325673,
               CreateStagiairesTable1786479914514,
               CreateEncadrantsTable1786489718770,
               CreateSujetsTable1786521725988,
               CreateCandidaturesTable1786522692401,
                AddRapportFichierUrlToStagiaires1786524577882,
                CreateRapportsTable1786524979103,
                CreateJournalEntriesTable1786526579902,
                AddIsSuperAdminToUsers1786531640866,
                CreateUtilisateursTable1786533830067,
                EnforceUniqueAccountEmails1786535000000,
                AddTypeStageAndTypeCandidat1787127569056,
                FixUniqueAccountEmailAllowLinkedPair1787200000000,
                AddMustChangePasswordToUsers1787300000000,
                AddCommentaireEncadrantToJournalEntries1787400000000,
                CreateTachesTable1787500000000], // Add your migration classes here

  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
