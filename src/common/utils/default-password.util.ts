/**
 * Génère un mot de passe par défaut PRÉVISIBLE, calculé à partir de
 * l'identité du titulaire du compte — décision prise en conversation pour
 * remplacer le mot de passe aléatoire (perdu si l'envoi d'email échoue,
 * voir MailService/Resend, dont l'appel est désactivé pour le moment).
 *
 * Formule : 2 lettres du nom + 3 lettres du prénom + date (JJMMAAAA),
 * tout en minuscule, accents et espaces retirés.
 * Exemple : nom="El Amrani", prénom="Sara", date=2026-09-01 → "elsar01092026"
 *
 * Appliqué aux 3 types de comptes (Stagiaire, Encadrant, Utilisateur
 * Admin/RH) : Stagiaire utilise sa date de début de stage ; Encadrant et
 * Utilisateur n'ont pas de date "métier" équivalente, on utilise donc la
 * date de création du compte.
 *
 * ⚠️ Mot de passe prévisible par construction — assumé pour le moment
 * (l'admin doit pouvoir le reconstituer et le communiquer sans dépendre
 * d'un service externe). Chaque compte doit changer ce mot de passe dès
 * sa première connexion via "Changer mon mot de passe" (voir
 * AuthService.changePassword) — c'est le filet de sécurité complémentaire.
 */
export function generateDefaultPassword(params: {
  nom: string;
  prenom: string;
  date: Date | string;
}): string {
  const nomPart = onlyLetters(params.nom).slice(0, 2).padEnd(2, 'x');
  const prenomPart = onlyLetters(params.prenom).slice(0, 3).padEnd(3, 'x');
  const datePart = formatDateJJMMAAAA(params.date);
  return `${nomPart}${prenomPart}${datePart}`;
}

/**
 * Sépare un nom complet ("Sara El Amrani") en { prenom, nom }, en
 * supposant la convention "Prénom Nom[...]" utilisée partout ailleurs
 * dans l'app (Stagiaire.name, Encadrant.name) : le premier mot est le
 * prénom, tout le reste (potentiellement plusieurs mots) est le nom.
 */
export function splitPrenomNom(fullName: string): { prenom: string; nom: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const prenom = parts[0] ?? '';
  const nom = parts.length > 1 ? parts.slice(1).join(' ') : prenom;
  return { prenom, nom };
}

function onlyLetters(value: string): string {
  // normalize('NFD') décompose les lettres accentuées en lettre de base +
  // diacritique séparé (é → e + ́) ; le filtre [^a-zA-Z] qui suit élimine
  // ensuite le diacritique en même temps que tout le reste (espaces,
  // apostrophes, tirets...), sans avoir besoin de le cibler explicitement.
  return value
    .normalize('NFD')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
}

function formatDateJJMMAAAA(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const jj = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const aaaa = d.getFullYear();
  return `${jj}${mm}${aaaa}`;
}
