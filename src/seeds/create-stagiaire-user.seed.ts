import * as bcrypt from 'bcrypt';
import dataSource from '../config/data-source';
import { User } from '../modules/auth/entities/user.entity';
import { Role } from '../common/enums/role.enum';

/**
 * Crée le compte de connexion Stagiaire de test défini dans
 * FRONTEND_ARCHITECTURE.md §5 :
 *   email    : sara.elamrani@emi.ac.ma
 *   password : stagiaire123
 *   role     : Stagiaire, lié à Stagiaire.id = 1 (Sara El Amrani)
 *
 * Suppose que le Stagiaire "Sara El Amrani" (id 1) existe déjà en base
 * (créé lors des tests Postman du module stagiaires) — si ce n'est pas
 * le cas, crée-le d'abord via POST /stagiaires.
 *
 * Idempotent, même pattern que create-admin.seed.ts et
 * create-encadrant-user.seed.ts.
 *
 * Usage : npm run seed:stagiaire
 */
async function run() {
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);

  const email = 'sara.elamrani@emi.ac.ma';
  const existing = await userRepository.findOne({ where: { email } });

  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Le compte ${email} existe déjà — rien à faire.`);
    await dataSource.destroy();
    return;
  }

  const stagiaireRows: Array<{ id: number }> = await dataSource.query(
    'SELECT id FROM stagiaires WHERE id = $1',
    [1],
  );
  if (stagiaireRows.length === 0) {
    // eslint-disable-next-line no-console
    console.error(
      "Aucun Stagiaire avec id=1 en base. Crée-le d'abord via POST /stagiaires (voir tests Postman du module stagiaires).",
    );
    await dataSource.destroy();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash('stagiaire123', 10);

  const stagiaireUser = userRepository.create({
    name: 'Sara El Amrani',
    email,
    passwordHash,
    role: Role.STAGIAIRE,
    encadrantId: null,
    stagiaireId: 1,
    compteActif: true,
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