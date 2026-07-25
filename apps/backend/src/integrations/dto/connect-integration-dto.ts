import { IsEnum, IsString, IsNotEmpty } from "class-validator";
import { Platform } from "../../../generated/prisma";

export class ConnectIntegrationDto {
  @IsEnum(Platform)
  platform!: Platform;

  @IsString()
  @IsNotEmpty()
  handle!: string;
}
