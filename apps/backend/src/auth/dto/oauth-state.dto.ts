import { IsString, IsNotEmpty, Matches } from "class-validator";

export class GithubCallbackDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-f0-9]{20,40}$/i, { message: 'Formato de código inválido' })
    code!: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Za-z0-9_-]{32,128}$/, { message: 'Invalid state format' })
    state!: string;
}