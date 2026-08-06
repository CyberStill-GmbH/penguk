import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";
import { UpdatePreferencesDto } from "./update-preferences.dto";

export class UpdateMeDto {
  @ValidateNested()
  @Type(() => UpdatePreferencesDto)
  @IsOptional()
  preferences?: UpdatePreferencesDto;
}
