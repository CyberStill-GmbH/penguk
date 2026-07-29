import { IsInt } from "class-validator";

export class SelectRepositoryDto {
  @IsInt()
  repositoryId!: number;
}
