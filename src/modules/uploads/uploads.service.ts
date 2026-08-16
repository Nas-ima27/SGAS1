import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export interface UploadedFile {
  /** Clé S3 (chemin dans le bucket) — utile pour la suppression future. */
  key: string;
  /** URL publique directe et permanente du fichier. */
  fileUrl: string;
  /** Nom de fichier original, pour affichage (rapportFichierNom, etc.). */
  fileName: string;
}

/**
 * Bucket PUBLIC pour l'instant (décision prise en conversation) : plus
 * simple pour avancer et tester la liaison frontend/backend rapidement.
 * À faire évoluer vers un bucket privé + URLs signées temporaires une
 * fois le reste de l'app stabilisé (voir discussion — le changement
 * touchera surtout ce fichier et les points de lecture de fichierUrl,
 * pas une refonte complète).
 */
@Injectable()
export class UploadsService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'eu-west-3';
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      // Uniquement renseigné pour un usage type MinIO en local — laissé
      // vide pour AWS S3 classique (voir .env.example).
      ...(process.env.AWS_S3_ENDPOINT ? { endpoint: process.env.AWS_S3_ENDPOINT } : {}),
      // Indispensable avec MinIO/endpoint custom : sans ça, le SDK tente
      // par défaut le style "virtual-hosted" (<bucket>.<endpoint>), qui
      // essaie de résoudre un nom de domaine inexistant comme
      // "sgas-fichiers.localhost" — erreur rencontrée en test.
      // AWS S3 réel n'a pas besoin de cette option (il gère les deux styles).
      forcePathStyle: !!process.env.AWS_S3_ENDPOINT,
    });
    this.bucket = process.env.AWS_S3_BUCKET || 'sgas-fichiers';
  }

  /**
   * Upload un fichier vers S3, sous un chemin préfixé par `folder`
   * (ex: "rapports", "cv") pour garder le bucket organisé. Le nom de
   * fichier est rendu unique (UUID) pour éviter toute collision entre
   * deux stagiaires déposant un fichier au même nom.
   *
   * ACL "public-read" : nécessite un bucket configuré pour accepter les
   * ACL publiques (Object Ownership ≠ "Bucket owner enforced" côté AWS,
   * et Block Public Access désactivé sur les objets).
   */
  // Type "any" utilisé volontairement (voir stagiaires.controller.ts) —
  // évite un conflit de types entre @types/express et @types/multer
  // rencontré en pratique ; sans risque ici, on n'accède qu'à des
  // propriétés (buffer, mimetype, originalname) présentes à l'exécution
  // quel que soit le typage.
  async uploadFile(file: any, folder: string): Promise<UploadedFile> {
    const key = `${folder}/${randomUUID()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );

    const endpoint = process.env.AWS_S3_ENDPOINT;
    // Style "path" avec MinIO (endpoint/bucket/key), cohérent avec
    // forcePathStyle ci-dessus ; style "virtual-hosted" classique pour
    // le vrai AWS S3 (bucket.s3.region.amazonaws.com/key).
    const fileUrl = endpoint
      ? `${endpoint}/${this.bucket}/${key}`
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return { key, fileUrl, fileName: file.originalname };
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}