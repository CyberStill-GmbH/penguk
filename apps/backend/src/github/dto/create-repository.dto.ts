import { IsString, IsNotEmpty, Matches } from "class-validator";

export class CreateRepositoryDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]+$/)
  name!: string;
}
