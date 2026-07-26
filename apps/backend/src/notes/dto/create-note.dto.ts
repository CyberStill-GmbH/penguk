import { IsString, IsNotEmpty, IsUUID, IsOptional } from "class-validator";

export class createNoteDto {
  @IsUUID()
  @IsOptional()
  problemId?: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
