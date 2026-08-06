import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { S3Provider } from "./providers/s3.provider";
import { ExportsService } from "./exports.service";

@Module({
  imports: [PrismaModule],
  providers: [ExportsService, S3Provider],
  exports: [ExportsService],
})
export class ExportsModule {}
