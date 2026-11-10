import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class UploadsService {
  private s3: S3Client;
  private bucket: string;
  private readonly region: string;

  constructor() {

    this.region = process.env.AWS_REGION!;
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.bucket = process.env.AWS_S3_BUCKET!;
  }

  async generateSignedUrl(fsKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fsKey,
    });

    return await getSignedUrl(this.s3, command, { expiresIn: 600 }); // 10 min
  }

  async getImageUrl(fsKey: string): Promise<string> {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fsKey}`;
  }

  async deleteFile(fsKey: string): Promise<void> {
    if (!fsKey) return;

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: fsKey,
        })
      );

      console.log(`🗑️ Arquivo removido do S3: ${fsKey}`);
    } catch (err) {
      console.error("❌ Erro ao deletar arquivo do S3:", err);
      throw new InternalServerErrorException("Falha ao remover imagem antiga");
    }
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');

    const fileExt = path.extname(file.originalname);
    const fileKey = `uploads/${uuidv4()}${fileExt}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype
        }),
      );
      return {
        fs_key: fileKey,
        url: `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
      };
    } catch (err) {
      console.error('Erro no upload S3:', err);
      throw new InternalServerErrorException('Falha ao enviar imagem');
    }
  }
}
