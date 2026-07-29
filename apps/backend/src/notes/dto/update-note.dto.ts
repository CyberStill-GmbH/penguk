import { IsString, IsOptional, IsUUID } from "class-validator";

export class UpdateNoteDto {
  @IsUUID()
  @IsOptional()
  problemId?: string | null;

  @IsString()
  @IsOptional()
  content?: string;
}
