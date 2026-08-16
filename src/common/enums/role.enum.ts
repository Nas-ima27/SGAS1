/**
 * Rôles applicatifs de SGAS (voir FRONTEND_ARCHITECTURE.md §1 et §5).
 *
 * Ces valeurs doivent rester synchronisées avec le type `role` utilisé
 * côté frontend dans `AuthUser` ("Admin" | "Encadrant" | "Stagiaire").
 */
export enum Role {
  ADMIN = 'Admin',
  ENCADRANT = 'Encadrant',
  STAGIAIRE = 'Stagiaire',
}