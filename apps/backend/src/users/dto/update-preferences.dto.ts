import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdatePreferencesDto {
  @IsOptional()
  @IsIn(["light", "dark"])
  theme?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  language?: string;
}
