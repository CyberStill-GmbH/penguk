import { IsString, IsOptional, IsUUID } from "class-validator";

export class updateNoteDto {
  @IsUUID()
  @IsOptional()
  problemId?: string | null;

  @IsString()
  @IsOptional()
  content?: string;
}
