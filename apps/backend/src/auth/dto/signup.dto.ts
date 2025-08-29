import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { UserRole } from '../../common/enums/role.enum'

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

    @IsEnum(UserRole)
    @IsOptional()
    role!: UserRole

    @IsString()
    @IsOptional()
    headline?: string

    @IsString()
    @IsOptional()
    avatarUrl?: string
}
