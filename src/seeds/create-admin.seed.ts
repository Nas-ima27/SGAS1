import * as bcrypt from 'bcrypt';
import dataSource from '../config/data-source';
import { User } from '../modules/auth/entities/user.entity';
import { Role } from '../common/enums/role.enum';

/**
 * Crée le compte Admin de test défini dans BACKEND_SPEC.md §1 et
 * FRONTEND_ARCHITECTURE.md §5 (table des comptes de test) :
 *   email    : yasmine.bennani@sgas.ma
 *   password : admin123
 *   role     : Admin (pas d'entité métier liée)
 *
 * Idempotent : si le compte existe déjà, le script ne fait rien plutôt
 * que d'échouer sur une contrainte unique.
 *
 * Usage : npm run seed
 */
async function run() {
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);

  const email = 'yasmine.bennani@sgas.ma';
  const existing = await userRepository.findOne({ where: { email } });

  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Le compte ${email} existe déjà — rien à faire.`);
    await dataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = userRepository.create({
    name: 'Yasmine Bennani',
    email,
    passwordHash,
    role: Role.ADMIN,
    encadrantId: null,
    stagiaireId: null,
    compteActif: true,
    isSuperAdmin: true,
  });

  await userRepository.save(admin);

  // eslint-disable-next-line no-console
  console.log(`Compte Admin créé : ${email} / admin123`);

  await dataSource.destroy();
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Erreur lors du seed :', error);
  process.exit(1);
});