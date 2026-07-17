import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class SignupDto {
    @IsEmail()
    email!: string

    @IsString()
    @MinLength(2)
    firstName!: string

    @IsString()
    @MinLength(2)
    lastName!: string

    @IsString()
    @MinLength(6)
    password!: string

    @IsString()
    @IsOptional()
    headline?: string

    @IsString()
    @IsOptional()
    avatarUrl?: string
}
