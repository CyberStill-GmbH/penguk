import { IsString, IsNotEmpty, IsUUID, IsOptional } from "class-validator";

export class CreateNoteDto {
  @IsUUID()
  @IsOptional()
  problemId?: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
