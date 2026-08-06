import { Injectable } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3Provider {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) throw new Error("AWS_S3_BUCKET no está configurado");
    this.bucket = bucket;

    this.client = new S3Client({ region: process.env.AWS_REGION });
  }

  async uploadJson(key: string, data: unknown): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: JSON.stringify(data),
        ContentType: "application/json",
      }),
    );
  }

  async getSignedDownloadUrl(
    key: string,
    expiresInSeconds: number,
  ): Promise<string> {
    const command = new GetObjectCommand({ Key: key, Bucket: this.bucket });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}
