import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Platform } from "../../../generated/prisma";
import { Type } from "class-transformer";

export class ListProblemsQueryDto {
  @IsEnum(Platform)
  @IsOptional()
  platform?: Platform;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsOptional()
  tags?: string[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number = 0;
}
