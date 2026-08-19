/**
 * Type de candidat visé par un sujet de stage — permet à un encadrant
 * de préciser si son sujet s'adresse à des stagiaires PFA, PFE, ou
 * indifféremment aux deux.
 */
export enum TypeCandidatSujet {
  PFA = 'PFA',
  PFE = 'PFE',
  PFA_ET_PFE = 'PFA et PFE',
}