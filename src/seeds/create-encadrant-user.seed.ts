import * as bcrypt from 'bcrypt';
import dataSource from '../config/data-source';
import { User } from '../modules/auth/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { Encadrant } from '../modules/encadrants/entities/encadrant.entity';

/**
 * MODIFIÉ — ce script crée maintenant l'Encadrant lui-même (plus besoin
 * de le créer manuellement via POST /encadrants/Postman au préalable) :
 * décision prise pour permettre un démarrage 100% automatique (Docker),
 * sans intervention manuelle.
 *
 * Idempotent : si un Encadrant avec cet email existe déjà, ne recrée rien.
 *
 * Usage : npm run seed:encadrant
 */
async function run() {
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const encadrantRepository = dataSource.getRepository(Encadrant);

  const email = 'karima.alaoui@sgas.ma';

  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    // eslint-disable-next-line no-console
    console.log(`Le compte ${email} existe déjà — rien à faire.`);
    await dataSource.destroy();
    return;
  }

  // Crée l'Encadrant s'il n'existe pas déjà (par email), réutilise sinon.
  let encadrant = await encadrantRepository.findOne({ where: { email } });
  if (!encadrant) {
    encadrant = encadrantRepository.create({
      name: 'Karima Alaoui',
      title: 'Ingénieure Senior',
      departement: "Systèmes d'Information",
      email,
      compteActif: true,
    });
    encadrant = await encadrantRepository.save(encadrant);
    // eslint-disable-next-line no-console
    console.log(`Encadrant créé : ${encadrant.name} (id=${encadrant.id})`);
  }

  const passwordHash = await bcrypt.hash('encadrant123', 10);

  const encadrantUser = userRepository.create({
    name: encadrant.name,
    email,
    passwordHash,
    role: Role.ENCADRANT,
    encadrantId: encadrant.id,
    stagiaireId: null,
    compteActif: true,
    // Compte de démo, identifiants documentés et réutilisés à chaque
    // test — pas de mot de passe par défaut à changer (voir
    // AddMustChangePasswordToUsers, mustChangePassword côté User).
    mustChangePassword: false,
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