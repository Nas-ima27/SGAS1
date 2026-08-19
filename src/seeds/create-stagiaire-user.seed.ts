import * as bcrypt from 'bcrypt';
import dataSource from '../config/data-source';
import { User } from '../modules/auth/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { Stagiaire } from '../modules/stagiaires/entities/stagiaire.entity';
import { StagiaireStatut } from '../modules/stagiaires/enums/stagiaire-statut.enum';
import { StagiaireRapportStatut } from '../modules/stagiaires/enums/stagiaire-rapport-statut.enum';
import { TypeStage } from '../modules/stagiaires/enums/type-stage.enum';

/**
 * MODIFIÉ — ce script crée maintenant le Stagiaire lui-même (plus besoin
 * de le créer manuellement via POST /stagiaires/Postman au préalable).
 * Idempotent : si un Stagiaire avec cet email existe déjà, ne recrée rien.
 *
 * Usage : npm run seed:stagiaire
 */
async function run() {
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const stagiaireRepository = dataSource.getRepository(Stagiaire);

  const email = 'sara.elamrani@emi.ac.ma';

  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    // eslint-disable-next-line no-console
    console.log(`Le compte ${email} existe déjà — rien à faire.`);
    await dataSource.destroy();
    return;
  }

  let stagiaire = await stagiaireRepository.findOne({ where: { email } });
  if (!stagiaire) {
    stagiaire = stagiaireRepository.create({
      name: 'Sara El Amrani',
      email,
      ecole: 'EMI',
      filiere: 'Génie Informatique',
      typeStage: TypeStage.PFA,
      departement: "Systèmes d'Information",
      dateDebut: '2026-09-01',
      dateFin: '2027-02-28',
      avancement: 0,
      statut: StagiaireStatut.A_VENIR,
      rapportStatut: StagiaireRapportStatut.NON_DEPOSE,
      compteActif: true,
    });
    stagiaire = await stagiaireRepository.save(stagiaire);
    // eslint-disable-next-line no-console
    console.log(`Stagiaire créé : ${stagiaire.name} (id=${stagiaire.id})`);
  }

  const passwordHash = await bcrypt.hash('stagiaire123', 10);

  const stagiaireUser = userRepository.create({
    name: stagiaire.name,
    email,
    passwordHash,
    role: Role.STAGIAIRE,
    encadrantId: null,
    stagiaireId: stagiaire.id,
    compteActif: true,
    // Compte de démo, identifiants documentés et réutilisés à chaque
    // test — pas de mot de passe par défaut à changer (voir
    // AddMustChangePasswordToUsers, mustChangePassword côté User).
    mustChangePassword: false,
  });

  await userRepository.save(stagiaireUser);

  // eslint-disable-next-line no-console
  console.log(`Compte Stagiaire créé : ${email} / stagiaire123`);

  await dataSource.destroy();
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Erreur lors du seed :', error);
  process.exit(1);
});