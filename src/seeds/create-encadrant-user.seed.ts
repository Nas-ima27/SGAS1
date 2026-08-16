import * as bcrypt from 'bcrypt';
import dataSource from '../config/data-source';
import { User } from '../modules/auth/entities/user.entity';
import { Role } from '../common/enums/role.enum';

/**
 * Crée le compte de connexion Encadrant de test défini dans
 * FRONTEND_ARCHITECTURE.md §5 :
 *   email    : karima.alaoui@sgas.ma
 *   password : encadrant123
 *   role     : Encadrant, lié à Encadrant.id = 1 (Karima Alaoui)
 *
 * Suppose que l'Encadrant "Karima Alaoui" (id 1) existe déjà en base
 * (créé lors des tests Postman du module encadrants) — si ce n'est pas
 * le cas, crée-le d'abord via POST /encadrants avant de lancer ce script.
 *
 * Idempotent, comme create-admin.seed.ts.
 *
 * Usage : npm run seed:encadrant
 */
async function run() {
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);

  const email = 'karima.alaoui@sgas.ma';
  const existing = await userRepository.findOne({ where: { email } });

  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Le compte ${email} existe déjà — rien à faire.`);
    await dataSource.destroy();
    return;
  }

  // Vérifie que l'Encadrant lié existe bien, pour un message d'erreur clair
  // plutôt qu'une contrainte SQL obscure si jamais il manque.
  const encadrantRows: Array<{ id: number }> = await dataSource.query(
    'SELECT id FROM encadrants WHERE id = $1',
    [1],
  );
  if (encadrantRows.length === 0) {
    // eslint-disable-next-line no-console
    console.error(
      "Aucun Encadrant avec id=1 en base. Crée-le d'abord via POST /encadrants (voir tests Postman du module encadrants).",
    );
    await dataSource.destroy();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash('encadrant123', 10);

  const encadrantUser = userRepository.create({
    name: 'Karima Alaoui',
    email,
    passwordHash,
    role: Role.ENCADRANT,
    encadrantId: 1,
    stagiaireId: null,
    compteActif: true,
  });

  await userRepository.save(encadrantUser);

  // eslint-disable-next-line no-console
  console.log(`Compte Encadrant créé : ${email} / encadrant123`);

  await dataSource.destroy();
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Erreur lors du seed :', error);
  process.exit(1);
});