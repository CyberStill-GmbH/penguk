import { IsUUID, IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class ListNotesQueryDto {
  @IsUUID()
  @IsOptional()
  problemId?: string;

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
